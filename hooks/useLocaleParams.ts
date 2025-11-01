import {useParams as useNextParams} from 'next/navigation'

export const useLocaleParams = () => {
    return useNextParams() as { locale?: string } | null
}
