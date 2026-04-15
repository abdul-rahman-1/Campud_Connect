#!/usr/bin/env python3
"""
Modern Tkinter UI for managing ESP32 device configurations
Add, Edit, Delete ESP32 devices with IP addresses
"""

import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
import json
import os
from pathlib import Path
from typing import List, Dict, Optional

class ESP32ConfigManager:
    """Manages ESP32 configuration JSON file"""
    
    def __init__(self, config_file: str = "esp32_config.json"):
        self.config_file = config_file
        self.data = self.load_config()
    
    def load_config(self) -> Dict:
        """Load configuration from JSON file"""
        try:
            if os.path.exists(self.config_file):
                with open(self.config_file, 'r') as f:
                    return json.load(f)
            return {"devices": []}
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load config: {e}")
            return {"devices": []}
    
    def save_config(self) -> bool:
        """Save configuration to JSON file"""
        try:
            with open(self.config_file, 'w') as f:
                json.dump(self.data, f, indent=2)
            return True
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save config: {e}")
            return False
    
    def get_devices(self) -> List[Dict]:
        """Get all devices"""
        return self.data.get("devices", [])
    
    def add_device(self, device: Dict) -> bool:
        """Add new device"""
        if not self.validate_device(device):
            return False
        self.data["devices"].append(device)
        return self.save_config()
    
    def update_device(self, index: int, device: Dict) -> bool:
        """Update existing device"""
        if not self.validate_device(device):
            return False
        if 0 <= index < len(self.data["devices"]):
            self.data["devices"][index] = device
            return self.save_config()
        return False
    
    def delete_device(self, index: int) -> bool:
        """Delete device by index"""
        if 0 <= index < len(self.data["devices"]):
            self.data["devices"].pop(index)
            return self.save_config()
        return False
    
    @staticmethod
    def validate_device(device: Dict) -> bool:
        """Validate device data"""
        required_fields = ["unit_id", "name", "ip_address"]
        for field in required_fields:
            if not device.get(field, "").strip():
                messagebox.showerror("Validation Error", f"Field '{field}' is required")
                return False
        return True


class ESP32UIApp:
    """Modern Tkinter UI Application"""
    
    def __init__(self, root):
        self.root = root
        self.root.title("ESP32 Device Manager")
        self.root.geometry("800x600")
        self.root.configure(bg="#f0f0f0")
        
        # Manager
        self.manager = ESP32ConfigManager()
        self.selected_index = None
        
        # Configure styles
        self.setup_styles()
        
        # Build UI
        self.setup_ui()
        self.refresh_device_list()
    
    def setup_styles(self):
        """Configure ttk styles for modern look"""
        style = ttk.Style()
        style.theme_use('clam')
        
        # Configure colors
        style.configure('Title.TLabel', font=('Segoe UI', 16, 'bold'), background="#f0f0f0")
        style.configure('TLabel', font=('Segoe UI', 10), background="#f0f0f0")
        style.configure('TButton', font=('Segoe UI', 10))
        style.configure('Treeview', font=('Segoe UI', 10), rowheight=25)
        style.configure('Treeview.Heading', font=('Segoe UI', 10, 'bold'))
    
    def setup_ui(self):
        """Setup main UI components"""
        # Header
        header_frame = tk.Frame(self.root, bg="#2c3e50", height=60)
        header_frame.pack(fill=tk.X)
        
        title_label = tk.Label(
            header_frame, 
            text="ESP32 Device Manager",
            font=('Segoe UI', 18, 'bold'),
            bg="#2c3e50",
            fg="white"
        )
        title_label.pack(pady=15)
        
        # Main content
        content_frame = tk.Frame(self.root, bg="#f0f0f0")
        content_frame.pack(fill=tk.BOTH, expand=True, padx=15, pady=15)
        
        # Treeview with Scrollbar
        tree_frame = tk.Frame(content_frame, bg="#f0f0f0")
        tree_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 15))
        
        columns = ("Unit ID", "Name", "IP Address")
        self.tree = ttk.Treeview(
            tree_frame,
            columns=columns,
            height=15,
            show='headings'
        )
        
        # Define columns
        self.tree.column("Unit ID", width=150, anchor=tk.W)
        self.tree.column("Name", width=250, anchor=tk.W)
        self.tree.column("IP Address", width=150, anchor=tk.W)
        
        # Headings
        for col in columns:
            self.tree.heading(col, text=col)
        
        # Scrollbar
        scrollbar = ttk.Scrollbar(tree_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        # Pack with scrollbar
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Bind selection
        self.tree.bind('<<TreeviewSelect>>', self.on_select)
        
        # Button Frame
        button_frame = tk.Frame(content_frame, bg="#f0f0f0")
        button_frame.pack(fill=tk.X, pady=(10, 0))
        
        # Add button
        add_btn = tk.Button(
            button_frame,
            text="➕ Add Device",
            command=self.add_device_dialog,
            bg="#27ae60",
            fg="white",
            font=('Segoe UI', 10, 'bold'),
            padx=15,
            pady=8,
            relief=tk.FLAT,
            cursor="hand2"
        )
        add_btn.pack(side=tk.LEFT, padx=5)
        
        # Edit button
        self.edit_btn = tk.Button(
            button_frame,
            text="✏️ Edit Device",
            command=self.edit_device_dialog,
            bg="#3498db",
            fg="white",
            font=('Segoe UI', 10, 'bold'),
            padx=15,
            pady=8,
            relief=tk.FLAT,
            cursor="hand2",
            state=tk.DISABLED
        )
        self.edit_btn.pack(side=tk.LEFT, padx=5)
        
        # Delete button
        self.delete_btn = tk.Button(
            button_frame,
            text="🗑️ Delete Device",
            command=self.delete_device_dialog,
            bg="#e74c3c",
            fg="white",
            font=('Segoe UI', 10, 'bold'),
            padx=15,
            pady=8,
            relief=tk.FLAT,
            cursor="hand2",
            state=tk.DISABLED
        )
        self.delete_btn.pack(side=tk.LEFT, padx=5)
        
        # Refresh button
        refresh_btn = tk.Button(
            button_frame,
            text="🔄 Refresh",
            command=self.refresh_device_list,
            bg="#95a5a6",
            fg="white",
            font=('Segoe UI', 10, 'bold'),
            padx=15,
            pady=8,
            relief=tk.FLAT,
            cursor="hand2"
        )
        refresh_btn.pack(side=tk.LEFT, padx=5)
    
    def refresh_device_list(self):
        """Refresh device list from manager"""
        # Clear existing items
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Load devices
        devices = self.manager.get_devices()
        for device in devices:
            self.tree.insert(
                '',
                tk.END,
                values=(
                    device.get('unit_id', ''),
                    device.get('name', ''),
                    device.get('ip_address', '')
                )
            )
    
    def on_select(self, event):
        """Handle tree selection"""
        selection = self.tree.selection()
        if selection:
            self.selected_index = self.tree.index(selection[0])
            self.edit_btn.config(state=tk.NORMAL)
            self.delete_btn.config(state=tk.NORMAL)
        else:
            self.selected_index = None
            self.edit_btn.config(state=tk.DISABLED)
            self.delete_btn.config(state=tk.DISABLED)
    
    def add_device_dialog(self):
        """Open dialog to add new device"""
        dialog = tk.Toplevel(self.root)
        dialog.title("Add New Device")
        dialog.geometry("400x320")
        dialog.configure(bg="#f0f0f0")
        dialog.grab_set()
        
        # Center on parent
        self.center_window(dialog, self.root)
        
        # Fields
        fields = {}
        for i, (label_text, field_name) in enumerate([
            ("Unit ID:", "unit_id"),
            ("Device Name:", "name"),
            ("IP Address:", "ip_address")
        ]):
            label = ttk.Label(dialog, text=label_text)
            label.pack(anchor=tk.W, padx=20, pady=(20 if i == 0 else 15, 5))
            
            entry = ttk.Entry(dialog, width=35)
            entry.pack(anchor=tk.W, padx=20, pady=(0, 5))
            fields[field_name] = entry
        
        # Buttons
        button_frame = tk.Frame(dialog, bg="#f0f0f0")
        button_frame.pack(fill=tk.X, padx=20, pady=20)
        
        def save():
            device = {field: entry.get().strip() for field, entry in fields.items()}
            if self.manager.add_device(device):
                messagebox.showinfo("Success", "Device added successfully!")
                self.refresh_device_list()
                dialog.destroy()
        
        tk.Button(
            button_frame,
            text="Save",
            command=save,
            bg="#27ae60",
            fg="white",
            padx=20,
            pady=8,
            relief=tk.FLAT,
            cursor="hand2"
        ).pack(side=tk.LEFT, padx=5)
        
        tk.Button(
            button_frame,
            text="Cancel",
            command=dialog.destroy,
            bg="#95a5a6",
            fg="white",
            padx=20,
            pady=8,
            relief=tk.FLAT,
            cursor="hand2"
        ).pack(side=tk.LEFT, padx=5)
    
    def edit_device_dialog(self):
        """Open dialog to edit selected device"""
        if self.selected_index is None:
            messagebox.showwarning("Warning", "Please select a device to edit")
            return
        
        device = self.manager.get_devices()[self.selected_index]
        
        dialog = tk.Toplevel(self.root)
        dialog.title("Edit Device")
        dialog.geometry("400x320")
        dialog.configure(bg="#f0f0f0")
        dialog.grab_set()
        
        self.center_window(dialog, self.root)
        
        # Fields
        fields = {}
        for i, (label_text, field_name) in enumerate([
            ("Unit ID:", "unit_id"),
            ("Device Name:", "name"),
            ("IP Address:", "ip_address")
        ]):
            label = ttk.Label(dialog, text=label_text)
            label.pack(anchor=tk.W, padx=20, pady=(20 if i == 0 else 15, 5))
            
            entry = ttk.Entry(dialog, width=35)
            entry.insert(0, device.get(field_name, ''))
            entry.pack(anchor=tk.W, padx=20, pady=(0, 5))
            fields[field_name] = entry
        
        # Buttons
        button_frame = tk.Frame(dialog, bg="#f0f0f0")
        button_frame.pack(fill=tk.X, padx=20, pady=20)
        
        def save():
            if self.selected_index is None:
                messagebox.showerror("Error", "No device selected!")
                return
            
            updated_device = {field: entry.get().strip() for field, entry in fields.items()}
            if self.manager.update_device(self.selected_index, updated_device):
                messagebox.showinfo("Success", "Device updated successfully!")
                self.refresh_device_list()
                dialog.destroy()
        
        tk.Button(
            button_frame,
            text="Save",
            command=save,
            bg="#3498db",
            fg="white",
            padx=20,
            pady=8,
            relief=tk.FLAT,
            cursor="hand2"
        ).pack(side=tk.LEFT, padx=5)
        
        tk.Button(
            button_frame,
            text="Cancel",
            command=dialog.destroy,
            bg="#95a5a6",
            fg="white",
            padx=20,
            pady=8,
            relief=tk.FLAT,
            cursor="hand2"
        ).pack(side=tk.LEFT, padx=5)
    
    def delete_device_dialog(self):
        """Confirm and delete selected device"""
        if self.selected_index is None:
            messagebox.showwarning("Warning", "Please select a device to delete")
            return
        
        device = self.manager.get_devices()[self.selected_index]
        
        if messagebox.askyesno(
            "Confirm Delete",
            f"Are you sure you want to delete '{device['name']}'?"
        ):
            if self.manager.delete_device(self.selected_index):
                messagebox.showinfo("Success", "Device deleted successfully!")
                self.refresh_device_list()
                self.selected_index = None
    
    @staticmethod
    def center_window(window, parent):
        """Center dialog window on parent window"""
        window.update_idletasks()
        x = int(parent.winfo_x() + (parent.winfo_width() // 2) - (window.winfo_width() // 2))
        y = int(parent.winfo_y() + (parent.winfo_height() // 2) - (window.winfo_height() // 2))
        window.geometry(f"+{x}+{y}")


def main():
    root = tk.Tk()
    app = ESP32UIApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
