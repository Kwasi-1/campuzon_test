import { Input as InputField } from "@/components/ui/input";


function Input({ id, type, placeholder, value, required, onChange }: { id: string; type: string; placeholder: string; value: string; required?: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <InputField
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`border-0 border-b rounded-none focus-visible:ring-0 px-0 focus:ring-0 focus:border-primary`}
      required={required}
    />
  )
}
export default Input;