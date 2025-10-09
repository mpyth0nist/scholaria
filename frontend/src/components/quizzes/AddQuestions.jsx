
import { TextInput, SaveButton, ManyInputs } from "../Reusable_components"


const AddQuestions = (props) => {
    return (

        <div className="flex gap-[1rem] flex-col delay-500" >
            <TextInput value={props.question.question_text} state={props.question} name="question_text" type="question" setter={props.setter} handleChange={props.handleChange} plh="Question text.." />
            <select className="p-5 font-sans border-[2px] border-violet-600 bg-[#2c3e50]" value={props.question?.question_type} onChange={(e) => props.handleChange(props.question, "question_type", e.target.value, props.setter)}>
                <option value={props.question_type}>Multi Choices</option>
                <option value={props.question_type}>true_false</option>
            </select>
            

            {
                props.question.question_type === 'multiple_choices' ? 
                    <div>
                        <h1>Question Choices</h1>
                        <input type="text" className="w-full max-w-md p-4 rounded-md border border-violet-500 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400" value={props.choice.choice} placeholder="Choice.." onChange={(e) => props.handleChoice(e.target.value)}/>
                        <button type="reset" onClick={(e) => props.addChoice(e.target.value)}>Add Another Question</button>
                        
                    </div>
                    :
                    null
            }


            <button type="reset" onClick = {() => props.handleSave(props.question)}>Save Question</button>

            <button type="submit" onClick={props.handleSubmit}>Submit Quiz</button>
            


        </div>

      
    )
}

export default AddQuestions;