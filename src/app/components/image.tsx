import { omit } from 'lodash'
import {
  LazyLoadImage,
  trackWindowScroll,
  LazyLoadImageProps,
} from 'react-lazy-load-image-component'

const Image = ({
  effect = 'black-and-white',
  ...props
}: LazyLoadImageProps) => {
  const sanitizedProps = omit(props, 'forwardRef')

  return (
    <div className="flex items-center">
      <LazyLoadImage effect={effect} {...sanitizedProps} />
    </div>
  )
}

export default trackWindowScroll(Image)
