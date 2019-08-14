import { LoggerService } from '../../services/logger/types';
import { StateService } from '../../services/state/types';

import { Id } from '../id/types';
import { Position } from './types';

export const delta = (dimension: 'x' | 'y' | 'z') => (
	a: Position,
	b: Position,
) => a[dimension] - b[dimension];
export const deltaX = delta('x');
export const deltaY = delta('y');
export const deltaZ = delta('z');

export const getDistance = (a: Position, b: Position) =>
	Math.sqrt(deltaX(a, b) ** 2 + deltaY(a, b) ** 2 + deltaZ(a, b) ** 2);

export const areNearby = (range: number) => (a: Position, b: Position) =>
	getDistance(a, b) < range;

type MovePosition = (deps: {
	loggerService: LoggerService;
}) => (params: {
	currentPosition: Position;
	distancePerTick: number;
	targetPosition: Position;
}) => Position;
export const movePosition: MovePosition = ({ loggerService }) => ({
	currentPosition,
	distancePerTick,
	targetPosition,
}): Position => {
	const distanceX = deltaX(targetPosition, currentPosition);
	const distanceY = deltaY(targetPosition, currentPosition);
	const distanceZ = deltaZ(targetPosition, currentPosition);
	loggerService.debug('Entering movePosition…');
	loggerService.debug(
		`Distances: X-axis=${distanceX}, Y-axis=${distanceY}, Z-axis=${distanceZ}`,
	);
	const distanceBetweenTargetAndCurrent = getDistance(
		targetPosition,
		currentPosition,
	);
	loggerService.debug(`Total distance ${distanceBetweenTargetAndCurrent}`);
	if (distanceBetweenTargetAndCurrent === 0) {
		return currentPosition;
	}
	const incrementX =
		(distancePerTick * distanceX) / distanceBetweenTargetAndCurrent;
	const incrementY =
		(distancePerTick * distanceY) / distanceBetweenTargetAndCurrent;
	const incrementZ =
		(distancePerTick * distanceZ) / distanceBetweenTargetAndCurrent;
	loggerService.debug(
		`Increments per tick: X-axis=${incrementX}, Y-axis=${incrementY}, Z-axis=${incrementZ}`,
	);
	const newX = currentPosition.x + incrementX;
	const newY = currentPosition.y + incrementY;
	const newZ = currentPosition.z + incrementZ;
	loggerService.debug(
		`New coordinates (before cut-off): X-axis=${newX}, Y-axis=${newY}, Z-axis=${newZ}`,
	);
	const finalX =
		incrementX > 0
			? newX > targetPosition.x
				? targetPosition.x
				: newX
			: newX < targetPosition.x
			? targetPosition.x
			: newX;
	const finalY =
		incrementY > 0
			? newY > targetPosition.y
				? targetPosition.y
				: newY
			: newY < targetPosition.y
			? targetPosition.y
			: newY;
	const finalZ =
		incrementZ > 0
			? newZ > targetPosition.z
				? targetPosition.z
				: newZ
			: newZ < targetPosition.z
			? targetPosition.z
			: newZ;
	loggerService.debug(
		`Final coordinates : X-axis=${finalX}, Y-axis=${finalY}, Z-axis=${finalZ}`,
	);
	return { x: finalX, y: finalY, z: finalZ };
};

export const isSamePosition = (positionA: Position, positionB: Position) =>
	positionA.x === positionB.x &&
	positionA.y === positionB.y &&
	positionA.z === positionB.z;

export const getEntityCurrentPosition = ({
	id,
	loggerService,
	stateService,
}: {
	id: Id;
	loggerService: LoggerService;
	stateService: StateService;
}): Position => {
	loggerService.debug('Entering getEntityCurrentPosition…');
	return stateService.findEntityById({ id }).currentPosition;
};
