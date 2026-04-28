export const TextInput = ({state, name, value, plh, setter, handleChange}) => {

    return <input className="w-full max-w-md p-4 rounded-md border border-action bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400" type="text" 
    name={name} value={value} onChange={(e) => handleChange(state,e.target.name, e.target.value, setter)} placeholder={plh} />

}



