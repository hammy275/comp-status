import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";

interface ComputerStatusProps {
    data: object
}

function ComputerStatus({data}: ComputerStatusProps) {
    const rows = [];
    for (const [name, computer_data] of Object.entries(data)) {
        const memory_usage = Math.round(computer_data.used_memory / computer_data.current_memory * 100) / 100;
        const cpu_temp = "cpu_pack_temp" in computer_data ? <TableCell>{`${computer_data.cpu_pack_temp}°C`}</TableCell> : <TableCell/>
        rows.push(
            <TableRow key={name}>
                <TableCell>{name}</TableCell>
                <TableCell>{computer_data.cpu_usage}</TableCell>
                <TableCell>{`${computer_data.used_memory} GB of ${computer_data.current_memory} GB (${memory_usage}% usage)`}</TableCell>
                {cpu_temp}
            </TableRow>
        );
    }

    return (
        <>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Computer</TableCell>
                            <TableCell>CPU Usage</TableCell>
                            <TableCell>Memory</TableCell>
                            <TableCell>CPU Temperature</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    )
}

export default ComputerStatus