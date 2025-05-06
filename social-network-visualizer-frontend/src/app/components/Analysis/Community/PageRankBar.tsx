interface Props { value: number }

export default function PageRankBar({ value }: Props) {
    return (
        <div className="w-full h-2 bg-neutral-700/70 rounded-full overflow-hidden">
            <div className="h-full bg-[#7140F4]" style={{ width: `${Math.min(value, 1) * 100}%` }}/>
        </div>
    );
}
