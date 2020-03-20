import { LightningElement, track } from 'lwc';

export default class ChooseObject extends LightningElement {

    @track searchTerm;
    @track objectSchemaSuccess = false;
    @track objectApiName;

    
    handleObjectSearchTermChange(event){
        this.searchTerm = event.target.value;
    }

    handleObjectSubmit(){
        this.objectSchemaSuccess = true;
        this.objectApiName = this.searchTerm;
    }

    handleCancel(event) {
        event.preventDefault();
        this.objectSchemaSuccess = false;
        this.searchTerm = '';
    }
    
}