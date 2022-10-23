const mongoose = require('mongoose')

const isValidEmail = function(email) {
    const regexForEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regexForEmail.test(email);
};

const isValidPhone = function(phone) {
    const regexForMobile = /^[6-9]\d{9}$/;
    return regexForMobile.test(phone);
};

const isValidProfile=function(value){
    const r=/^[a-zA-Z0-9]+[\\.](jpg|png|jpeg)$/ 
      return r.test(value)
  }
function isValidPassword(value){

    return /^[a-z]\d{8,15}$/.test(value)
}
function isValidRemoveProduct(value){
    return /^[0-1]{1}$/.test(value)
}
function isValidPincode(data) {
    return /[\S]?\d{6}$/.test(data)
}
const isValidInputValue = function(value) {
    if (typeof(value) === 'undefined' || value === null) return false
    if (typeof(value) === 'string' && value.trim().length > 0) return true
    return false
}
const isValidStreet=function(value){
    value=value.trim()
    return /^\w+([\s]?\w+[.,$,#,@]?)*$/.test(value)
}
const isValidCity=function(value){
    return /^[\S][a-zA-Z]+$/
}
const isValidName=function(value){
    return /^[A-Za-z]+((\s)?[A-Za-z]+)*$/.test(value)
}
function isValidPrice(value){
    return /^[1-9]{1}\d*((\.)\d+)?$/.test(value)
}
const isValidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
};
const isValidInputBody = function(object) {
    return Object.keys(object).length > 0
}
const isValidAddress = function (value) {
    if (typeof (value) === "undefined" || value === null) return false;
    if (typeof (value) === "object" && Array.isArray(value) === false && Object.keys(value).length > 0) return true;
    if (typeof (value) === "object" && Array.isArray(value) === true && value.length > 0) return true
    return false;
};
const isValidInstallments=function(value){
    return /^[1-9]{1}$/.test(value)
}
const isValid=function(value){
    if(value==undefined || value==null)return false
    if(typeof(value)=="string" && value.trim().length>0)return true
    return false
}
module.exports = {
    isValidEmail,
    isValidPhone,
    isValidProfile,
    isValidPassword,
    isValidPincode,
    isValidInputValue,
    isValidStreet,
    isValidName,
    isValidInputValue,
    isValidObjectId,
    isValidInputBody,
    isValidAddress,
    isValidCity,
    isValidPrice,
    isValidInstallments,
    isValidRemoveProduct,
    isValid
}