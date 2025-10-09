export const TextInput = ({state, name, value, plh, setter, handleChange}) => {

    return <input className="w-full max-w-md p-4 rounded-md border border-violet-500 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400" type="text" 
    name={name} value={value} onChange={(e) => handleChange(state,e.target.name, e.target.value, setter)} placeholder={plh} />

}

export const SubmitButton = ({value}) => {
    return <input type="submit" value={value} className="mt-4 w-full max-w-md p-4 bg-violet-500 hover:bg-cyan-400 rounded-md text-white font-semibold cursor-pointer transition-colors duration-200" />
}

export const ManyInputs = (props) => {

    return (
        <div>
            <input type="text" className="w-full max-w-md p-4 rounded-md border border-violet-500 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400" name={props.name} value={props.value} placeholder={props.placeholder} onChange={(e) => props.handleChange(e.target.value)}/>
            <button tyep="reset" onClick={() => props.handleReset(props.value)}>Add {props.buttonText}</button>
        </div>
    )
}

export const SaveButton = ({handleSave, data}) => {
    return <button type="reset" onClick={() => handleSave(data)}>Save</button>
}