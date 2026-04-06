import React from "react";

export function InputField({
  label,
  placeholder,
  icon,
  type = "text",
  right,
  value,
  onChange,
  className = "",
  ...props
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="text-sm font-semibold text-slate-700 ml-1">{label}</label>}
      <div className="group flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm shadow-slate-200/20 transition-all focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50">
        {icon && <div className="mr-3 text-slate-400 group-focus-within:text-blue-500 transition-colors">{icon}</div>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 text-slate-900"
          {...props}
        />
        {right}
      </div>
    </div>
  );
}