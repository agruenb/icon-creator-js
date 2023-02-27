export default class Animator{
    static switchPos(element_1, element_2, duration_seconds = 1){
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
        setTimeout(()=>{
            element_1.style.transition = "";
            element_2.style.transition = "";
            element_1.style.transform = "";
            element_2.style.transform = "";
        }, duration_seconds*1000);
    }
    static switchStack(element_1, element_2, duration_seconds = 1){
        let pos_1 = element_1.getBoundingClientRect();
        let pos_2 = element_2.getBoundingClientRect();
        let y_travel_dist_1 = pos_2.y - pos_1.y + pos_2.height - pos_1.height;
        let y_travel_dist_2 = pos_1.y - pos_2.y;
        element_1.style.transition = `${duration_seconds}s`;
        element_1.style.transform = `translate(0px,0px)`;
        element_1.style.transform = `translate(0px,${y_travel_dist_1}px)`;
        element_2.style.transition = `${duration_seconds}s`;
        element_2.style.transform = `translate(0px,0px)`;
        element_2.style.transform = `translate(0px,${y_travel_dist_2}px)`;
        setTimeout(()=>{
            element_1.style.transition = "";
            element_2.style.transition = "";
            element_1.style.transform = "";
            element_2.style.transform = "";
        }, duration_seconds*1000);
    }
}