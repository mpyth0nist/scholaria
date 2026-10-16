import markUrl from '../../assets/brand/edah-mark.svg'

/**
 * Edah's logo mark: an open book and the flame of knowledge under a
 * horseshoe arch (after al-Qarawiyyin in Fez). Decorative by default;
 * pass a `label` when the mark stands alone and needs to be announced.
 */
export default function EdahMark({ size = 36, label, className = '' }) {
    return (
        <img
            src={markUrl}
            width={size}
            height={size}
            alt={label ?? ''}
            aria-hidden={label ? undefined : true}
            draggable={false}
            className={`shrink-0 select-none ${className}`}
        />
    )
}
