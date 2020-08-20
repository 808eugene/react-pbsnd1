import React from "react";
import Modal from 'react-modal';
import ReactDOM from "react-dom";
import { withAlert } from "react-alert";
import preloader from '/preloader.svg'


const customStyles = {
    content : {
      top                   : '50%',
      left                  : '50%',
      right                 : 'auto',
      bottom                : 'auto',
      marginRight           : '-50%',
      transform             : 'translate(-50%, -50%)'
    }
  };

class DataTable extends React.Component{
    

    constructor() {
        super();

        this.state = {
            data: [],
            modalIsOpen: false,
            humanToUpdate: null,
            dataReceiving: true
        }
        
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.deleteHuman = this.deleteHuman.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.dataRows = this.dataRows.bind(this);
    }

    openModal() {
        this.setState({modalIsOpen: true});      
        this.setState({newHuman: {fio:"", age:"", height:"", nationality:""}});

      }

    closeModal() {
        this.setState({modalIsOpen: false});
    }

    componentDidMount() {
        
        fetch("http://178.128.196.163:3000/api/records")
        .then((response) => response.json())
        .then((response) => {
           this.setState({data: response, dataReceiving: false})
        })
        .catch((error) => {
            if (error) {
                this.props.alert.error("Произошла ошибка " + error.message);
            }
        })

	}

    dataRows(data) {
        var rows = []
        for (var i = 0; i < data.length; i++) {
            var rowData = data[i].data;
            var id = data[i]._id;       
            var disabled = true;
            var buttonName = "Редактировать"
            if (this.state.humanToUpdate && id == this.state.humanToUpdate._id) {
                disabled = false;
                buttonName = "Сохранить"
                rowData=this.state.humanToUpdate.data;
            }

            rows.push(<tr>               
                <th><input class="form-control" name = "fio" id = {'fio_'+id} type = "text" onChange={this.onChangeUpdateInput.bind(this)} value = {rowData.fio} disabled={disabled}></input></th>
                <th><input class="form-control" name = "age" id = {'age_'+id} type = "text" onChange={this.onChangeUpdateInput.bind(this)} class="form-control" value = {rowData.age} disabled={disabled}  size="3"></input></th>
                <th><input class="form-control" name = "height" id = {'height_'+id} type = "text" onChange={this.onChangeUpdateInput.bind(this)} value = {rowData.height} disabled={disabled} size="4"></input></th>
                <th><input class="form-control" name = "nationality" id = {'nationality_'+id} type = "text" onChange={this.onChangeUpdateInput.bind(this)} value = {rowData.nationality} disabled={disabled} size="8"></input></th>
                <th><button class = "btn btn-warning edit" onClick={this.updateHuman.bind(this, id)}>{buttonName}</button></th>
                <th><button class = "btn btn-danger" onClick={this.deleteHuman.bind(this, id)}>Удалить</button></th>
            </tr>)
        }
        return [rows]
    }

    onChangeUpdateInput(event){

        var value = event.target.value;
        var name = event.target.name;


        var humanToUpdate = this.state.humanToUpdate;
        humanToUpdate.data[name] = value;

        this.setState({humanToUpdate});
    }

    onChangeCreateInput(event){
        var value = event.target.value;
        var name = event.target.name;
        
        this.state.newHuman[name] = value;
    }

    updateHuman(id, event){
        

        if (!this.state.humanToUpdate || id != this.state.humanToUpdate._id) {
            this.setState({humanToUpdate: this.getHumanById(id)});
        } else {

            if (!parseInt(this.state.humanToUpdate.data.age, 10)) {              
                this.props.alert.error("Возраст не валиден");
                return;
            }
            if (!parseFloat(this.state.humanToUpdate.data.height, 10)) {
               
                this.props.alert.error("Рост не валиден");
                return;
            }
            
            this.state.humanToUpdate.data.age = parseInt(this.state.humanToUpdate.data.age, 10);
            this.state.humanToUpdate.data.height = parseFloat(this.state.humanToUpdate.data.height, 10);

            fetch("http://178.128.196.163:3000/api/records/"+id, {
                method: 'POST',
                body: JSON.stringify({data:this.state.humanToUpdate.data}),
                headers: {'Content-Type': 'application/json'},
            })
            .then((response) => response.json())
            .then((response) => { 
                this.setState({
                    data: this.state.data.map((human) =>  human._id == id ? this.state.humanToUpdate : human)
                });
                this.setState({humanToUpdate: null});
                this.props.alert.success("Данные обновлены");
            })
            .catch((error) => {
               
                if (error) {
                    this.props.alert.error("Произошла ошибка " + error.message);
                }
            })

        }



    }


   getHumanById(id){
        var foundHuman = this.state.data.filter((human) => human._id == id)[0];
        return {
            _id: foundHuman._id,
            data: {
                fio: foundHuman.data.fio,
                age: foundHuman.data.age,
                height: foundHuman.data.height,
                nationality: foundHuman.data.nationality
            }
        }
   }

    deleteHuman(id, event){
        event.preventDefault();


        fetch("http://178.128.196.163:3000/api/records/"+id, {
            method: 'DELETE',           
        })
        .then((response) => {
            var fio = this.getHumanById(id).data.fio;
            var data = this.state.data.filter((human) => human._id != id)
            this.setState({data})
            this.props.alert.success("Человек с именем '" + fio + "' удален");
        })
        .catch((error) => {
           
            if (error) {
                this.props.alert.error("Произошла ошибка " + error.message);
            }
        })


    }


    onSubmit(e) {
        e.preventDefault();
        if (!parseInt(this.state.newHuman.age, 10)) {           
            this.props.alert.error("Возраст не валиден");
            return;
        }
        if (!parseFloat(this.state.newHuman.height, 10)) {           
            this.props.alert.error("Рост не валиден");
            return;
        }
        var human = {            
            "fio": this.state.newHuman.fio, 
            "age": parseInt(this.state.newHuman.age, 10), 
            "height": parseFloat(this.state.newHuman.height, 10), 
            "nationality": this.state.newHuman.nationality
        }

        var humanJson = {"data": human}


        fetch("http://178.128.196.163:3000/api/records", {
            method: 'PUT',
            body: JSON.stringify(humanJson),
            headers: {'Content-Type': 'application/json'},
        })
        .then((response) => response.json())
        .then((response) => {   
                this.state.data.push(response); 
                this.closeModal()
                this.props.alert.success("Человек с именем '" + response.data.fio + "' добавлен");
        })
        .catch((error) => {
           
            if (error) {
                this.props.alert.error("Произошла ошибка " + error.message);
            }
        })


    }

    render() {
        const rows = this.dataRows(this.state.data)
        return (
            <div class = "row">
                <div class = "col-md-2">
                </div>
                <div class = "col-md-8">
                
            <button class = "btn btn-primary add" onClick={this.openModal}>Добавить</button>
                <Modal
                isOpen={this.state.modalIsOpen}
                onRequestClose={this.closeModal}
                style={customStyles}
                contentLabel="Example Modal"
                >

                   
                    <span onClick={this.closeModal} class="glyphicon glyphicon-remove button-remove" aria-hidden="true"></span>
                    <h4 class = "modal-title">Добавить человека</h4>
                    <form>
                        ФИО <input type="text" className="form-control" onChange={this.onChangeCreateInput.bind(this)} name="fio"/>
                            <br />
                        Возраст <input type="text" className="form-control" onChange={this.onChangeCreateInput.bind(this)} name="age"/>
                            <br />
                        Рост <input type="text" className="form-control" onChange={this.onChangeCreateInput.bind(this)} name="height"/>
                            <br />
                            Гражданство <input type="text" className="form-control" onChange={this.onChangeCreateInput.bind(this)} name="nationality"/>
                            <br />
                            <button class = "btn btn-primary" onClick={this.onSubmit}>Добавить</button>
                        
                    </form>
                </Modal>




            <table class="table">
            <thead>
            <tr>
                
                <th>ФИО</th>
                <th>Возраст</th>
                <th>Рост</th>  
                <th>Гражданство</th>
            </tr>
            </thead>
            <tbody>
                {rows}
                
            </tbody>
            </table>
            {this.state.dataReceiving ? <img class = "img-preloader" src = {preloader} /> : null}
            </div>
            <div class = "col-md-2">
                </div>
            </div>


        )
    }
}

export default DataTable
