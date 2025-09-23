import { TextInput, SubmitButton } from "../Reusable_components"

const AddQuestions = (props) => {


    return (

        <div>
            <TextInput value={props.questionText} onChange={props.handleChange} placeholder="Question text.." />
            <select value={props.selection} onChange={(e) => props.handleSelection(e.target.value)}>
                <option value="Multi Choices">Multi Choices</option>
                <option value="Text">Text</option>
                <option value="True/False">Boolean [True/False]</option>
            </select>

        </div>

      
    )
}

export default AddQuestions;