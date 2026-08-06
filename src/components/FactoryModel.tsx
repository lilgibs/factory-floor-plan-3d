import { useGLTF } from '@react-three/drei';
import type { ComponentProps } from 'react';

type PrimitiveProps = Omit<ComponentProps<'primitive'>, 'object'>;

export function FactoryModel(props: PrimitiveProps) {
  const { scene } = useGLTF('/factory_asset.glb');

  return <primitive object={scene} {...props} />;
}

useGLTF.preload('/factory_asset.glb');
