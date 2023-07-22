export default function PhButton({ onClick, children }: { onClick: () => void, children: React.ReactNode }) {
    return <button onClick={onClick} className="btn h-6 m-3 bg-amber-50/20 hover:bg-amber-100/50 transition duration-300 hover:scale-105 text-white/80">
        {children}
    </button>
}