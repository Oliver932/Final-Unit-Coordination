
export function removeItem(list, element){

    for( var i = 0; i < list; i++){ 
                                    
        if ( list[i] === element) { 
            list.splice(i, 1); 
            i--; 
        }
    }
}