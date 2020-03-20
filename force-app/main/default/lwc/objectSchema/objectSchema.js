import { LightningElement, api, wire, track } from "lwc";
import { getObjectInfo } from "lightning/uiObjectInfoApi";

export default class ObjectSchema extends LightningElement {
  @api objectApiName;
  @track objectMetaData;
  @track columns;
  @track data = [];
  @track likeState = false;
  @track generateQueryState = false;
  @track queryGenerateState = false;

  @track childRelationships = [];
  @track dependentFields = [];
  @track fields;
  @track cardTitle;
  @track completeArray;
  @track filteredArray;
  @track generatedQuery;

  @track filteredArray;
  @track completeArray;

  

  @wire(getObjectInfo, { objectApiName: "$objectApiName" })
  objectRecordData({ error, data }) {
    if (error) {
      console.log(error);
    } else if (data) {
      this.cardTitle = `Schema for  ${this.objectApiName}`;
      this.objectMetaData = data;
      //console.log(data);
      this.dataTableSetup(this.objectMetaData);
    }
  }

  dataTableSetup(tableData) {
    this.columns = [
      { label: "Field", fieldName: "apiName" },
      { label: "Type", fieldName: "dataType" },
      { label: "Parent", fieldName: "parent" }
    ];
    this.childRelationships = tableData.childRelationships;
    this.dependentFields = tableData.dependentFields;
    this.fields = tableData.fields;
    let filteredArray = [];
    let completeArray = [];
    const dataEntries = Object.entries(this.fields).filter(field => {
      const filteredFields = field[1];

      if (
        filteredFields.createable &&
        filteredFields.updateable &&
        filteredFields.apiName !== "OwnerId"
      ) {
        filteredArray = [
          {
            apiName: filteredFields.apiName,
            dataType: filteredFields.dataType,
            parent: filteredFields.relationshipName,
            referenceToInfos: [filteredFields.referenceToInfos]
          },
          ...filteredArray
        ];
      }

      completeArray = [
        {
          apiName: filteredFields.apiName,
          dataType: filteredFields.dataType,
          parent: filteredFields.relationshipName,
          referenceToInfos: [filteredFields.referenceToInfos]
        },
        ...completeArray
      ];
      return filteredFields;
    });
    this.data = completeArray;

    this.completeArray = completeArray;
    this.filteredArray = filteredArray;
  }

  handleFilter() {
    if (this.likeState === true) {
      this.data = this.completeArray;
    } else {
      this.data = this.filteredArray;
    }
    this.likeState = !this.likeState;
  }

  handleCancel() {
    this.dispatchEvent(new CustomEvent("cancel"));
  }

  handleGenerateQuery() {
    this.generateQueryState = true;
    this.queryCreation();
  }

  queryCreation(){
    let selectClause = `SELECT `;
    // eslint-disable-next-line no-unused-vars
    let fieldReference = ``;
    this.filteredArray.forEach(field => {
      if(!field.parent){
        selectClause = `${selectClause} ${field.apiName}, `;
      }
      else {
        const { nameFields } = field.referenceToInfos[0][0];
        if(nameFields){
          if(nameFields.length === 1) {
            fieldReference = nameFields[0];
          }
          else {
            if(nameFields.includes("Name")){
              fieldReference = "Name"
            }
            else {
              fieldReference = nameFields[0];
            }
          }
          selectClause = `${selectClause} ${field.parent}.${fieldReference},`
        }
      } 
    });
    
    selectClause = selectClause.substring(0, selectClause.length-1);
    const fromClause = ` FROM ${this.objectApiName}`;
    this.generatedQuery = `${selectClause} ${fromClause}`
  }
  
}