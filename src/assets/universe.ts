export interface Planet {
  name: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

export interface Universe {
  planetList: Array<Planet>;
}

export const EMPTY_UNIVERSE = {
  planetList: [],
};
