export interface IProgram {
	update(deltaT: number, T: number): void;
	draw  (): void;
}