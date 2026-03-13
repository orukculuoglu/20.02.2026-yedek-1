import { VehicleRootBinding } from './vehicle-root-binding';
import { GraphEdge } from '../edges/graph-edge';
import { isValidRootBinding } from './root-binding-validator';
import { toRootBindingEdge } from './root-binding-edge';

export function executeRootBinding(binding: VehicleRootBinding): GraphEdge | null {
  if (!isValidRootBinding(binding)) {
    return null;
  }
  return toRootBindingEdge(binding);
}
