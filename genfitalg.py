from __future__ import division
#import os
#import sys
#import json 
import numpy as np
#import glob
import matplotlib.pyplot as plt
from lmfit import minimize, Parameters, Parameter, report_fit, fit_report
from lmfit.model import save_modelresult
from scipy.integrate import odeint
from numpy import genfromtxt

plt.style.use('ggplot')
model_name = "SIR-Modell"
"""
model_name = "SIRD-Model-Deutschland"
ew_zahl = 80000000
start = 250
steps = 70
confirmed = genfromtxt('Deutschland.csv', delimiter=',', skip_header=start, usecols=3, max_rows= steps)
recovered = genfromtxt('Deutschland.csv', delimiter=',', skip_header=start, usecols=4, max_rows= steps)
death = genfromtxt('Deutschland.csv', delimiter=',', skip_header=start, usecols=5, max_rows= steps)
i_measured = np.zeros(confirmed.size)

for i in range(confirmed.size):
    i_measured[i] = confirmed[i]-recovered[i]-death[i]

sir_ = {"S": "-t0*y0*y1/N", "I": "t0*y0*y1/N-t1*y1", "R": "t1*y1"}
sird_ = {"S": "-t0*y0*y1/N", "I": "t0*y0*y1/N-t1*y1-t2*y1", "R": "t1*y1", "D": "t2*y1"}
seir_ = {"S": "-t0*y0*y2/N", "E": "t0*y0*y2/N-t1*y1", "I": "t1*y1-t2*y2", "R": "t2*y2"}
sirv_ = {"S": "-t0*y1*y0/N-t2*y0", "I": "t0*y1*y0/N-t1*y1", "R": "t1*y1", "V": "t2*y0"}
sis_vac = {"S": "-t0*y0*y1/N - t1*y0 + t2*t3*y1", "I": "t0*y0*y1/N + t0*t4*y2*y1/N - t3*y1", "V": "t1*y0 - t0*t4*y2*y1/N + (1-t2)*t3*y1"}
"""
#data_ = {"Data": {"I": i_measured}, "Model": {"Equations": seir_, "Parameters": ["t0","t1","t2"], "IV": [ew_zahl-i_measured[0],0,i_measured[0],0], "N": ew_zahl}}
#data_ = {"Data": {"I": i_measured}, "Model": {"Equations": sir_, "Parameters": ["t0","t1"], "IV": [ew_zahl-i_measured[0],i_measured[0],0], "N": ew_zahl}}
#data_ = {"Data": {"I": [25,75,227,296,258,236,192,126,71,28,11,7]}, "Model": {"Equations": sird_, "Parameters": ["t0","t1","t2"], "IV": [763-25,25,0,0], "N": 763}}
#data_ = {"Data": {"I": i_measured}, "Model": {"Equations": sirv_, "Parameters": ["t0","t1","t2"], "IV": [ew_zahl-i_measured[0],i_measured[0],0,0], "N": ew_zahl}}
#data_ = {"Data": {"I": i_measured}, "Model": {"Equations": sis_vac, "Parameters": ["t0","t1","t2","t3","t4"], "IV": [ew_zahl-i_measured[0],i_measured[0],0], "N": ew_zahl}}
#data_ = {"Data": {"I": i_measured}, "Model": {"Equations": sird_, "Parameters": ["t0","t1","t2"], "IV": [ew_zahl-i_measured[0],i_measured[0],0,0], "N": ew_zahl}}


"""
data_ = {"Data": 
                {"I": [25,75,227,296,258,236,192,126,71,28,11,7]}, 
        "Model": 
            {"Equations": {"S": "-alpha*S*I/N", "I": "alpha*S*I/N-beta*I", "R": "beta*I"}, 
                "Parameters": ["alpha","beta"], 
                "state_ids": ["S", "I", "R"],
                "N": 763,
                "IV": [738,25,0],
                "Compartments_to_Fit": ["I"]
            }
        }
        
"""      
"""

{"Model":
            {"Equations": {"s0": "-t0*s0*s1/N", "s1": "t0*s0*s1/N-t1*s1", "s2": "t1*s1"}, 
            "Parameters": ["t0","t1"], 
            "state_ids": ["s0", "s1", "s2"],
            "N": 763,
            "IV": [738,25,0],
            "Compartments_to_Fit": ["s1"]
            }
}

{"Model": 
        {"Equations": {"S": "-alpha*S*I/N", "I": "alpha*S*I/N-beta*I", "R": "beta*I"}, 
            "Parameters": ["alpha","beta"], 
            "state_ids": ["S", "I", "R"],
            "N": 763,
            "IV": [738,25,0],
            "Compartments_to_Fit": ["I"]
        }
}
"""   

class fit_model_to_data: 
    def __init__(self, json_data, model_name): 
        # initialize the model equations, parameters, initial values and population size
        self.model_name = model_name
        self.json_data = json_data
        self.equations = self.json_data["Model"]["Equations"]
        self.parameters = self.json_data["Model"]["Parameters"]
        self.initial_values = self.json_data["Model"]["IV"]
        self.population = self.json_data["Model"]["N"]
        
        # check which compartments the user wants to fit and which position they have in the model
        self.fitting_comps = self.json_data["Model"]["Compartments_to_Fit"]
        self.data = np.array(self.json_data["Data"][self.fitting_comps[0]])
        self.fitting_comps_pos = []
        for comp in self.fitting_comps: 
            self.fitting_comps_pos.append(list(self.equations).index(comp))
        

    
    # right hand side of ODE
    def f(self, right_hand_side_data, t, paras):
        erg_list = []
        N = self.population
        # generate global variables dynamically (necessary, because we don't know how many variables we need in advance)
        for i, comp in enumerate(self.equations): 
            globals()[comp] = right_hand_side_data[i]
            
        for param in self.parameters: 
            globals()[param] = paras[param].value
            
        
        #try:
            #t0 = paras['t0'].value
            #t1 = paras['t1'].value
        #except KeyError:
            #t0, t1 =paras
        
        # evaluate the equations given by the corresponding strings in json_data
        for key, value in self.equations.items():
            erg_list.append(eval(value))
        
        return erg_list
           
    # solve ODE
    def g(self, t, x0, paras):

        x = odeint(self.f, x0, t, args = (paras, ))
        return x
    
    # auxiliary functionx, that we need in order to call lmfit.minimize in self.solve_and_plot
    def residual(self, paras, t, data):
        # save initial values in x0-list
        x0 = []
        for key, values in paras.items(): 
            if key == self.parameters[0]:
                break
            x0.append(values.value)
            
        model = self.g(t, x0, paras)
        """
        for pos in self.fitting_comps_pos: 
            i_model = np.append(i_model, model[:, pos], axis=1)
        """
        i_model = model[:,self.fitting_comps_pos[0]]
        #i_model = model[:, self.infected_pos]
        return (i_model - data).ravel()

    def solve_and_plot(self): 
        
        # list of time points 
        t_measured = np.linspace(0,self.data.size-1, self.data.size)
        
        # plot given data
        #fig, ax= plt.subplots()
        #ax.scatter(t_measured, self.data, marker = 'o', color = 'b', label = 'measured data')

        # initialize initial values and initial model parameters
        params = Parameters()
        for i, comp in enumerate(self.equations): 
            params.add(comp, value=self.initial_values[i], vary=False)
        for param in self.parameters:
            params.add(param, value = 1, min = 0)

        # fit model
        result = minimize(self.residual, params, args = (t_measured, self.data), method ='leastsq')
        
        # solve ODE with estimated parameters values (maybe replace 500 with something, that depends on self.data.size)
        data_fitted = self.g(np.linspace(0., self.data.size-1, 500), self.initial_values, result.params)
        
        
        # plot fitted data
        #ax.plot(np.linspace(0., self.data.size-1, 500), data_fitted[: , self.fitting_comps_pos[0]], '-', linewidth = 2, color = 'red', label = 'fitted data')
        

        #ax.legend()
        #ax.set_title(self.model_name)
        #ax.set_xlabel("time in days")
        #ax.set_ylabel("Infected")
        # display fitted statistics
        #report_fit(result)
        
        #plt.show()

        with open("result.txt", "w") as text_file:
            text_file.write(fit_report(result))
        return data_fitted[:, self.fitting_comps_pos[0]]
        

#fit = fit_model_to_data(data_, model_name)
#erg = fit.solve_and_plot()




