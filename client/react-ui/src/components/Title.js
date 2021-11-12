export default function Title(props) {
    /**
     * Props:
     *  title: Title text
     *  textColor: Text color
     */

    return <h1 style={{color: props.textColor}} className="title is-1">{props.title}</h1>;
}