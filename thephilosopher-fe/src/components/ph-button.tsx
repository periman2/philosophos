import cn from 'classnames'
export default function PhButton({ onClick, children, className }: { onClick?: () => void, children: React.ReactNode, className?: string }) {
    return <button onClick={onClick || undefined} className={cn("btn btn-sm h-6 bg-amber-50/20 hover:bg-amber-100/50 transition duration-300 hover:scale-105 text-white/80 text-sm", className)}>
        {children}
    </button>
}