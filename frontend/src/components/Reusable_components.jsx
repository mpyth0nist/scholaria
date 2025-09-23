export const TextInput = ({name, value, plh, onChange}) => {

    return <input className="w-full max-w-md p-4 rounded-md border border-violet-500 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400" type="text" 
    name={name} value={value} onChange={(e) => onChange(e.target.name, e.target.value)} placeholder={plh} />

}

export const SubmitButton = ({value}) => {
    return <input type="submit" value={value} className="mt-4 w-full max-w-md p-4 bg-violet-500 hover:bg-cyan-400 rounded-md text-white font-semibold cursor-pointer transition-colors duration-200" />
}