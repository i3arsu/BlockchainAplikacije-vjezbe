// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudentRecord {
    struct Student{
        string name;
        uint grade;
    }

    mapping ( uint => Student ) public students;
    uint public count;

    function addStudent(string memory _name, uint _grade) public{
        students[count] = Student(_name, _grade);
        count++;
    }

    function getStudent(uint _id) public view returns (string memory) {
        Student memory s = students[_id];
        return s.name;
    }

    function updateStudent (uint _id, uint _newGrade) public{
        require(condition);
        //Update studenet grade
    }

}