class Process {
    name: string;
    burstTime: number;

    constructor(name: string, burstTime: number) {
        this.name = name;
        this.burstTime = burstTime;
    }
}

function roundRobin(processes: Process[], timeSlice: number): void {
    let queue: Process[] = [...processes];
    while (queue.length > 0) {
        let process = queue.shift();
        if (process) {
            if (process.burstTime > timeSlice) {
                console.log(`Executing ${process.name} for ${timeSlice} units`);
                process.burstTime -= timeSlice;
                queue.push(process);
            } else {
                console.log(`Executing ${process.name} for ${process.burstTime} units (finished)`);
                process.burstTime = 0;
            }
        }
    }
}

// 示例进程列表
let processes: Process[] = [
    new Process("P1", 5),
    new Process("P2", 3),
    new Process("P3", 7)
];
// 时间片长度
let timeSlice: number = 2;
// 调用 Round-Robin 调度函数
roundRobin(processes, timeSlice);
