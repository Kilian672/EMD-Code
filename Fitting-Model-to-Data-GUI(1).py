import tkinter as tk
from tkinter import ttk
from tkinter.messagebox import showerror
from tkinter import filedialog, messagebox
#import threading
#from threading import Thread
import json 
import os
import matplotlib.pyplot as plt
from numpy import genfromtxt
import numpy as np
import genfitalg

theme_color = "#8c07b8"
theme_font = "Arial"
theme_font_size_body = 15


class Custom_Button(tk.Button):
    def __init__(self, master, text, command):
        self.master = master
        self.text = text
        self.command = command
        self.color = "#8c07b8"
        self.font = "Arial"
        self.font_size = 15
        super().__init__(master=self.master, text=self.text, bg=self.color, fg="white", 
                            font=(self.font, self.font_size), bd=0, activebackground="white", 
                            activeforeground=self.color, command=self.command)
    
class Custom_Entry(tk.Entry): 
    def __init__(self, master, textvariable):
        self.master = master
        self.textvariable = textvariable
        self.color = "#8c07b8"
        self.font = "Arial"
        self.font_size = 15
        super().__init__(master = self.master, textvariable=self.textvariable, 
                            font=(self.font, self.font_size), 
                            highlightbackground=self.color, highlightthickness=3)
        
class Custom_Label(tk.Label): 
    def __init__(self, master, text):
        self.master = master
        self.text = text
        self.color = "#8c07b8"
        self.font = "Arial"
        self.font_size = 15
        super().__init__(master=self.master, text=self.text, bg="white", 
                            fg=self.color, font=(self.font, self.font_size))
        

class App(tk.Tk):

    def __init__(self):
        super().__init__()

        self.title('Fitting Tool')
        self.geometry("800x600")
        self.columnconfigure(0, weight=1)
        self.rowconfigure(0, weight=1)
        self.rowconfigure(1, weight=8)

        self.infected = np.zeros(1)
        self.data_fitted = np.zeros(1)
        self.infected_var_time = np.zeros(1)
        self.current_data_file = ""
        self.model = {}
        
        self.create_header_frame()
        self.create_body_frame()
        self.create_upload_frame()
        self.create_fitting_frame()
        self.create_display_frame()
           
    def create_header_frame(self):
        
        self.header_screen = tk.Frame(self, background=theme_color)
        self.header_screen.grid(row=0, column=0, sticky="nsew")

        self.header_screen.columnconfigure(0, weight=1)
        self.header_screen.columnconfigure(1, weight=4)

        self.header_screen.rowconfigure(0,weight=1)

        self.headline = tk.Label(self.header_screen, text="Fitting Tool", font=(theme_font, 24), fg="white", bg=theme_color)
        self.headline.grid(row=0, column=0, sticky="nsew")

    def create_body_frame(self):
        
        self.body_screen = tk.Frame(self, background="white")
        self.body_screen.grid(row=1, column=0,sticky="nsew")

        self.body_screen.columnconfigure(0, weight=1)
        self.body_screen.columnconfigure(1, weight=2)

        self.body_screen.rowconfigure(0, weight=1)
        self.body_screen.rowconfigure(1, weight=2)

    def create_upload_frame(self):
        
        self.upload_screen = tk.Frame(self.body_screen, background="white", highlightbackground=theme_color, highlightthickness=3)
        self.upload_screen.grid(row=0, column=0, sticky="nsew", padx=(10,5), pady=(10,5))

        self.upload_screen.columnconfigure(0, weight=1)
        self.upload_screen.columnconfigure(1, weight=2)
        self.upload_screen.columnconfigure(2, weight=6)

        self.upload_screen.rowconfigure(0, weight=2)
        self.upload_screen.rowconfigure(1, weight=1)
        self.upload_screen.rowconfigure(2, weight=1)
        self.upload_screen.rowconfigure(3, weight=1)
        self.upload_screen.rowconfigure(4, weight=2)

        self.model_button = Custom_Button(self.upload_screen, "Upload Model", self.Get_Model)
        self.model_button.grid(row=1, column=1, sticky="nsew")
        self.data_button = Custom_Button(self.upload_screen, "Upload Data", self.Get_Data)
        self.data_button.grid(row=3, column=1, sticky="nsew")

        self.model_file_label = Custom_Label(self.upload_screen, text="")
        self.model_file_label.grid(row=1, column=2, sticky="nsew")
        self.data_file_label = Custom_Label(self.upload_screen, text="")
        self.data_file_label.grid(row=3, column=2, sticky="nsew")

    def create_fitting_frame(self):
        
        self.entry_screen = tk.Frame(self.body_screen, background="white", highlightbackground=theme_color, highlightthickness=3, highlightcolor=theme_color)
        self.entry_screen.grid(row=1, column=0, sticky="nsew", padx=(10,5) , pady=(5,10))

        for i in range(5): 
            self.entry_screen.columnconfigure(i, weight=2)
        for i in range(10): 
            self.entry_screen.rowconfigure(i, weight=1)
        self.entry_screen.rowconfigure(10, weight=4)

        self.model_name_var = tk.StringVar(self.entry_screen, "Model-Name")
        self.model_name_entry = Custom_Entry(self.entry_screen, self.model_name_var)
        self.model_name_entry.grid(row=1, column=1, columnspan=2, sticky="nsew")
        
        self.start_var = tk.StringVar(self.entry_screen, 10)
        self.start_entry = Custom_Entry(self.entry_screen, self.start_var)
        self.start_entry.grid(row=3, column=1, columnspan=2, sticky="nsew")
        
        self.step_var = tk.StringVar(self.entry_screen, 50)
        self.step_entry = Custom_Entry(self.entry_screen, self.step_var)
        self.step_entry.grid(row=5, column=1, columnspan=2, sticky="nsew")
        
        self.model_name_label = Custom_Label(self.entry_screen, text="model name")
        self.model_name_label.grid(row=1, column=0, sticky="nsew")
        self.start_label = Custom_Label(self.entry_screen, text="start")
        self.start_label.grid(row=3, column=0, sticky="nsew")
        self.step_label = Custom_Label(self.entry_screen, text="step")
        self.step_label.grid(row=5, column=0, sticky="nsew")

        self.fit_button = Custom_Button(self.entry_screen, "Fit", self.Fit)
        self.fit_button.grid(row=7, column=1, padx=(0,5), sticky="nsew")
        self.show_plot_button = Custom_Button(self.entry_screen, text="Show Plot", command=self.Show_Plot)
        self.show_plot_button.grid(row=7, column=2, padx=(5,0), sticky="nsew")
        self.show_data_button = Custom_Button(self.entry_screen, "Show Data", self.Show_Data)
        self.show_data_button.grid(row=9, column=1, padx=(0,5), sticky="nsew")
        self.show_statistic_button = Custom_Button(self.entry_screen, "Show Statistic", self.Show_Statistic)
        self.show_statistic_button.grid(row=9, column=2, padx=(5,0), sticky="nsew")

    def create_display_frame(self):
        
        self.display_screen = tk.Frame(self.body_screen, background="white", highlightbackground=theme_color, highlightthickness=3, highlightcolor=theme_color)
        self.display_screen.grid(row=0, column=1, rowspan=2, sticky="nsew", padx=(5,10), pady=(10,10))

        self.display_screen.columnconfigure(0, weight=1)
        self.display_screen.columnconfigure(1, weight=4)
        self.display_screen.columnconfigure(2, weight=1)

        for i in range(11): 
            self.display_screen.rowconfigure(i, weight=1)

        self.column_var = tk.StringVar(self.display_screen, 7)
        self.column_entry =  Custom_Entry(self.display_screen, self.column_var)
        self.column_entry.grid(row=1, column=1, sticky="nsew")
        
        self.row_start_var = tk.StringVar(self.display_screen, 53457)
        self.row_start_entry =  Custom_Entry(self.display_screen, self.row_start_var)
        self.row_start_entry.grid(row=3, column=1, sticky="nsew")

        self.row_end_var = tk.StringVar(self.display_screen, 54174)
        self.row_end_entry =  Custom_Entry(self.display_screen, self.row_end_var)
        self.row_end_entry.grid(row=5, column=1, sticky="nsew")
        
        self.pop_var = tk.StringVar(self.display_screen, 83240000)
        self.pop_entry =  Custom_Entry(self.display_screen, self.pop_var)
        self.pop_entry.grid(row=7, column=1, sticky="nsew")
        
        self.change_data_button = Custom_Button(self.display_screen, "Change Data", self.Change_Data)
        self.change_data_button.grid(row=9, column=1, sticky="nsew")

        self.column_label = Custom_Label(self.display_screen, text="column")
        self.column_label.grid(row=1, column=0, sticky="nsew")

        self.row_start_label = Custom_Label(self.display_screen, text="start row")
        self.row_start_label.grid(row=3, column=0, sticky="nsew")

        self.row_end_label = Custom_Label(self.display_screen, text="end row")
        self.row_end_label.grid(row=5, column=0, sticky="nsew")

        self.pop_label = Custom_Label(self.display_screen, text="population")
        self.pop_label.grid(row=7, column=0, sticky="nsew")

    def Fit(self):
        
        self.fit_button["state"] = "disabled"

        if np.array_equiv(self.infected,np.zeros(1)): 
            self.fit_button["state"] = "normal"
            return   
        if self.model == {}: 
            self.fit_button["state"] = "normal"
            return   
        
        try:

            if(int(self.start_var.get())+int(self.step_var.get())>int(self.row_end_var.get())-int(self.row_start_var.get())):
                error_message = """Make sure to:\n
                \t - upload a data-file\n
                \t - write only permitted values in your entry-boxes\n   
                \t - start+step doesn\'t exceed the size of your data-file\n                   
                """
                messagebox.showinfo("Information", error_message)
                self.fit_button["state"] = "normal"
                return   

        except:
            error_message = """Make sure to:\n
                \t - upload a data-file\n
                \t - write only permitted values in your entry-boxes\n                     
                """
            messagebox.showinfo("Information", error_message)
            self.fit_button["state"] = "normal"
            return
                
        data_ = {}

        try:

            self.infected_var_time = self.infected[int(self.start_var.get()):int(self.start_var.get())+int(self.step_var.get())]
            data_["Data"] = {self.model["Model"]["Compartments_to_Fit"][0]: np.ndarray.tolist(self.infected_var_time)}

        except: 
            error_message = """Make sure to:\n
            \t - upload a data-file\n
            \t - write only permitted values in your entry-boxes\n                      
            """
            messagebox.showinfo("Information", error_message)
            self.fit_button["state"] = "normal"
            return     
        
        try: 

            data_["Model"] = self.model["Model"]
            data_["Model"]["N"] = int(self.pop_var.get())
            self.infected_pos = list(data_["Model"]["Equations"]).index(data_["Model"]["Compartments_to_Fit"][0])
            model_dim = len(list(data_["Model"]["Equations"]))
            iv_list = []

            for i in range(model_dim): 
                iv_list.append(0)

            iv_list[0] = data_["Model"]["N"]-self.infected_var_time[0]
            iv_list[self.infected_pos] = self.infected_var_time[0]  
            data_["Model"]["IV"] = iv_list
            
            fit = genfitalg.fit_model_to_data(data_, "")
            self.data_fitted = fit.solve_and_plot()
            self.fit_button["state"] = "normal"
            return

        except: 
            error_message = """Make sure to:\n
            \t - upload a data-file\n
            \t - write only permitted values in your entry-boxes\n   
            \t - start+step doesn\'t exceed the size of your data-file\n                   
            """
            messagebox.showinfo("Information", error_message)
            self.fit_button["state"] = "normal"
            return

    def Show_Plot(self):
    
        if np.array_equiv(self.data_fitted,np.zeros(1)) or np.array_equiv(self.infected_var_time,np.zeros(1)): 
            return 
        try:
            
            fig, ax= plt.subplots()
            ax.scatter(np.linspace(0, self.infected_var_time.size-1, self.infected_var_time.size), self.infected_var_time, marker = 'o', color = 'b', label = 'measured data')  
            ax.plot(np.linspace(0., self.infected_var_time.size-1, 500), self.data_fitted, '-', linewidth = 2, color = 'red', label = 'fitted data')
            ax.legend()
            ax.set_title(self.model_name_var.get())
            ax.set_xlabel("time in days")
            ax.set_ylabel("self.Infected")
            plt.show()
            return
        
        except:
            return

    def Show_Data(self):

        if np.array_equiv(self.infected,np.zeros(1)):
            error_message = """Make sure to:\n
            \t - upload a data-file\n                     
            """
            messagebox.showinfo("Information", error_message) 
            return 
        
        t_measured = np.linspace(0,self.infected.size-1, self.infected.size)
        plt.figure("Data")
        plt.title("Uploaded Data")
        plt.scatter(t_measured, self.infected, marker = 'o', color = 'b', label = 'measured data', s = 75)
        plt.show()
        return
  
    def Show_Statistic(self):
        
        if os.path.isfile("result.txt"):
            with open("result.txt") as f:
                content = f.read()
                label_app = tk.Tk()
                label_app.rowconfigure(0,weight=1)
                label_app.columnconfigure(0,weight=1)
                statistic_frame = tk.Frame(label_app, background="white", highlightbackground=theme_color, highlightthickness=3, highlightcolor=theme_color)
                statistic_frame.grid(row=0, column=0, sticky="nsew")
                statistic_frame.rowconfigure(0, weight=1)
                statistic_frame.columnconfigure(0, weight=1)
                
                statistic_label = Custom_Label(statistic_frame, content)
                statistic_label.grid(row=0, column=0, sticky="nsew")
                label_app.mainloop()
        else: 
            return

    def Change_Data(self):
        
        try: 

            self.infected = genfromtxt(self.current_data_file, delimiter=',', skip_header=int(self.row_start_var.get()), usecols=int(self.column_var.get())-1, max_rows=int(self.row_end_var.get())-int(self.row_start_var.get()))        
            self.infected = np.nan_to_num(self.infected, nan=0.0)
            return

        except: 
            error_message = """Make sure to:\n
            \t - upload a data-file\n
            \t - write only permitted values in your entry-boxes\n                      
            """
            messagebox.showinfo("Information", error_message)
            return

    def Get_Model(self):
        
        self.filename = filedialog.askopenfilename(title="Select File", filetypes={('json files', '*.json')})
    
        try:

            with open(str(self.filename),'r') as file:
                
                    self.model = json.load(file)
                    if(self.model["Model"]["Parameters"][0].isnumeric()):
                        for i, param in enumerate(self.model["Model"]["Parameters"]):
                            for key in self.model["Model"]["Equations"].keys():
                                self.model["Model"]["Equations"][key] = self.model["Model"]["Equations"][key].replace(param, 't%s'%i).replace("n", "N")
                    self.model_file_label.config(text=os.path.basename(str(self.filename)))
                    return
        
        except OSError: 
            return
        except:
            error_message = "Something went wrong!"
            messagebox.showinfo("Information", error_message)
            return
    
    def Get_Data(self):
        
        self.filename = filedialog.askopenfilename(title="Select File", filetypes={('csv files', '*.csv')})
    
        try: 
            #confirmed = genfromtxt(str(self.filename), delimiter=',', skip_header=1, usecols=3)
            #recovered = genfromtxt(str(self.filename), delimiter=',', skip_header=1, usecols=4)
            self.current_data_file = str(self.filename)
            self.infected = genfromtxt(str(self.filename), delimiter=',', skip_header=int(self.row_start_var.get()), usecols=int(self.column_var.get())-1, max_rows=int(self.row_end_var.get())-int(self.row_start_var.get()))
            #self.infected = np.zeros(confirmed.size)
            #for i in range(confirmed.size):
                #self.infected[i] = confirmed[i]-recovered[i]     
            self.infected = np.nan_to_num(self.infected, nan=0.0)
            self.data_file_label.config(text=os.path.basename(str(self.filename)))
            return
        
        except OSError:
            return
        except: 
            error_message = """Make sure to:\n
            \t - write only permitted values in your entry-boxes\n                      
            """
            messagebox.showinfo("Information", error_message)
            return
    
    
    



    

if __name__ == "__main__":
    app = App()
    app.mainloop()