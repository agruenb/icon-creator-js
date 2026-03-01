export default class Animator {
    static switchPos(element_1: HTMLElement, element_2: HTMLElement, duration_seconds: number = 1): void {
        let pos_1 = element_1.getBoundingClientRect();
        let pos_2 = element_2.getBoundingClientRect();
        let x_travel_dist_1 = pos_2.x - pos_1.x;
        let y_travel_dist_1 = pos_2.y - pos_1.y;
        let x_travel_dist_2 = pos_1.x - pos_2.x;
        let y_travel_dist_2 = pos_1.y - pos_2.y;
        element_1.style.transition = `${duration_seconds}s`;
        element_1.style.transform = `translate(0px,0px)`;
        element_1.style.transform = `translate(${x_travel_dist_1}px,${y_travel_dist_1}px)`;
        element_2.style.transition = `${duration_seconds}s`;
        element_2.style.transform = `translate(0px,0px)`;
        element_2.style.transform = `translate(${x_travel_dist_2}px,${y_travel_dist_2}px)`;
        setTimeout(() => {
            element_1.style.transition = "";
            element_2.style.transition = "";
            element_1.style.transform = "";
            element_2.style.transform = "";
        }, duration_seconds * 1000);
    }

    static switchStack(element_1: any, element_2: any, duration_seconds: number = 1, padding: number = 0): void {
        // padding argument was used in InfoBoxManager but not in JS version's Animator.switchStack
        // I'll add types and handle elements as HTMLElement
        const el1 = element_1 as HTMLElement;
        const el2 = element_2 as HTMLElement;
        let pos_1 = el1.getBoundingClientRect();
        let pos_2 = el2.getBoundingClientRect();
        let y_travel_dist_1 = pos_2.y - pos_1.y + pos_2.height - pos_1.height;
        let y_travel_dist_2 = pos_1.y - pos_2.y;
        el1.style.transition = `${duration_seconds}s`;
        el1.style.transform = `translate(0px,0px)`;
        el1.style.transform = `translate(0px,${y_travel_dist_1}px)`;
        el2.style.transition = `${duration_seconds}s`;
        el2.style.transform = `translate(0px,0px)`;
        el2.style.transform = `translate(0px,${y_travel_dist_2}px)`;
        setTimeout(() => {
            el1.style.transition = "";
            el2.style.transition = "";
            el1.style.transform = "";
            el2.style.transform = "";
        }, duration_seconds * 1000);
    }
}
