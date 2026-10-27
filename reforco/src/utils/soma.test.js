import {describe, it, expect} from 'vitest';
import { soma } from './soma';

describe('soma', () => {
    it('deve somar 3 + 2 e retornar 5', () => {
        expect(soma(3, 2)).toBe(5);
    });

    it('deve retornar 0 quando 0 + 0', () => {
        expect(soma(0, 0)).toBe(0);
    });

    it('deve retornar negativos para negativos', () => {
        expect(soma(-3, -2)).toBe(-5);
    });
});