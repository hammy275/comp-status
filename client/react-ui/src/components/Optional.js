export default function Optional(props) {
    /**
     * Props:
     *  cond: Condition that should be true-y when to show elem, and false-y when not
     *  elem: Element to show if cond is true
     */

    if (props.cond) {
        return props.elem;
    }
    return null;
}