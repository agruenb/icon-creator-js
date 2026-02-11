/**
 * @jest-environment node
 */
describe('Infrastructure Setup', () => {
    it('should run a basic test', () => {
        expect(true).toBe(true);
    });

    it('should support typescript', () => {
        const sum = (a: number, b: number): number => a + b;
        expect(sum(1, 2)).toBe(3);
    });
});
