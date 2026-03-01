/**
 * Manages color palettes and generates sequences of colors.
 */
export default class ColorMachine {
    type: string;
    index: number = 0;

    pastel: string[] = [
        "#E0BBE4",
        "#83BCD4",
        "#BEE8B7",
        "#957DAD",
        "#A4D1E0",
        "#F5B7B7",
        "#D291BC",
        "#B1DEE0",
        "#F6CACB",
        "#FEC8D8",
        "#D6F7D2",
        "#BEE8B7",
        "#FFDFD3"
    ];

    /**
     * @param type - The palette identifier (e.g. 'pastel')
     */
    constructor(type: string) {
        this.type = type;
    }

    /**
     * Returns the next color in the current palette and increments the index.
     * @returns A hex color string
     */
    next(): string {
        let index = this.index;
        let p = this.pallet();
        if (p) {
            this.index = (index + 1) % p.length;
            return p[index];
        }
        return "#000000"; // Fallback color
    }

    /**
     * Returns the current color palette array.
     * @returns Array of hex color strings or undefined if type is unknown
     */
    pallet(): string[] | undefined {
        switch (this.type) {
            case "pastel":
                return this.pastel;
            default:
                console.warn("Unknown color pallet " + this.type);
                return undefined;
        }
    }
}
