export default function Text(props) {
    return (
        <h5 style={{color: props.textColor}} className="title is-5">
            {props.text}
        </h5>
    );
}