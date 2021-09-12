export interface TimingPoint {
    id: string
    time: number

    bpm: number | null
}


export function generateTicks(bpm: number, startTime: number, endTime: number) {
    let time = startTime
    let i = 0

    let ticks = []

    while (time <= endTime) {

        ticks.push({
            time,
            index: i % 4
        })

        time += 60_000 / bpm
        i++
    }
    return ticks
}