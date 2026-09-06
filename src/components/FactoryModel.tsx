import { useGLTF } from '@react-three/drei';
// import type { ThreeEvent } from '@react-three/fiber';
import type { ComponentProps } from 'react';

type PrimitiveProps = Omit<ComponentProps<'primitive'>, 'object'>;

export function FactoryModel(props: PrimitiveProps) {
  const { scene } = useGLTF('/factory_asset.glb');

  // const handleClick = (event: ThreeEvent<MouseEvent>) => {
  //   const position = event.point.toArray().map((coordinate) =>
  //     Number(coordinate.toFixed(3))
  //   );

  //   console.log('FactoryModel click position [x, y, z]:', position);
  // };

  return <primitive
    object={scene}
    {...props}
  // onClick={handleClick}
  />;
}

useGLTF.preload('/factory_asset.glb');
