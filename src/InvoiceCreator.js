import React from 'react';
import {Button, Input, Label, FormGroup, Form, Table, Container, Row, Col} from 'reactstrap';
import axios from 'axios';

export default class InvoiceCreator extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            memo: '',
            items: [],
            selectedItems:[],
            total : 0.0,
            selectedAddItem: 'Item 1',
            selectedQuantity: 0
        }
        this.getItems= this.getItems.bind(this);
        this.handleSubmit= this.handleSubmit.bind(this);
        this.postInvoice= this.postInvoice.bind(this);
        this.renderItemOption = this.renderItemOption.bind(this);
        this.handleItemSelect = this.handleItemSelect.bind(this);
        this.handleQuantity = this.handleQuantity.bind(this);
        this.handleAddItem = this.handleAddItem.bind(this);
        this.addItemToCart = this.addItemToCart.bind(this);
        this.renderSelectedItemRows = this.renderSelectedItemRows.bind(this);
        this.handleMemo = this.handleMemo.bind(this);
    }
    
    resetState() {
        this.setState({
            memo: '',
            selectedItems:[],
            total : 0.0,
            selectedAddItem: 'Item 1',
            selectedQuantity: 0
        });
    }
    
    headers() {
        return {
          Authorization: `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtZXJjaGFudCI6IjZkMzI5Nzk3LWI2NGQtNDdkMS1hNDU3LTQ3OThlMmIzNjFiNSIsImdvZFVzZXIiOmZhbHNlLCJzdWIiOiI0ODI3ODAzNi1jYzE5LTQ3YWItYTgyOC03MzRiOWUxYWNlMDIiLCJpc3MiOiJodHRwOi8vYXBpZGVtby5mYXR0bGFicy5jb20vdGVhbS9hcGlrZXkiLCJpYXQiOjE1NTU0Mjg2MzMsImV4cCI6NDcwOTAyODYzMywibmJmIjoxNTU1NDI4NjMzLCJqdGkiOiJxZTNueklKdWlDOFhKN1dhIiwiYXNzdW1pbmciOmZhbHNlfQ.TEmlwmgVBLwt5x0FO4c-mbY3JgO_tgxcFRfznlOGSrM`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "cache-control": "no-cache"
        };
    }

    getItems() {
        return axios({
          url: 'https://apidemo.fattlabs.com/item',
          method: "get",
          headers: this.headers()
        }).then(result => {
            this.setState({items : result.data.data});
        });
    }

    postInvoice = () => {
        if (this.state.selectedItems.length > 0){
            const body = {
                "customer_id": "1f04379c-ebfc-4224-80c2-02a9473776e4",
                "payment_method_id":null,
                "meta": {
                    "tax":0,
                    "subtotal": this.state.total,
                    "memo" : this.state.memo,
                    "lineItems": this.state.selectedItems
                },
                "total": this.state.total,
                "url": "https://omni.fattmerchant.com/#/bill/",
                "send_now": false,
                "files": []
            }
            return axios({
            url: 'https://apidemo.fattlabs.com/invoice',
            method: "post",
            headers: this.headers(),
            data: body
            }).then(result => result.data);
        }
        
    }

    componentDidMount() {
        this.getItems();
    }

    handleSubmit() {
        alert("Invoice Submit Success!");
        this.postInvoice();
        this.resetState();
    }

    renderSelectedItemRows() {
        var MakeItem = function(x) {
            return (
            <tr>
                <td>{x.item}</td>
                <td>{x.quantity}</td>
                <td>{x.price}</td>
                <td>{x.quantity*x.price}</td>
            </tr>);
        };
        return (<tbody>
            {this.state.selectedItems.map(MakeItem)} 
        </tbody>);
        
        
    }

    renderCart(){
        if (this.state.selectedItems.length > 0){
            return (
                <div style= {{alignItems:'center'}}>
                    <h2>Cart</h2>
                    <Table bordered>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        {this.renderSelectedItemRows()}         
                    </Table>
                </div>
                
            );
        } else {
            return (
                <div>
                    No Items selected
                </div>
            );
        }
    }

    handleItemSelect(value) {
        this.setState({selectedAddItem : value});
    }

    handleQuantity(value) {
        this.setState({selectedQuantity : value});
    }

    handleMemo(value) {
        this.setState({memo : value});
    }

    handleAddItem() {
        if (this.state.selectedQuantity > 0){
            console.log("Trying to add item");
            this.addItemToCart(this.state.selectedAddItem);
        } 
    }

    addItemToCart(name){
        for (var i = 0; i <this.state.items.length; i++){
            if (this.state.items[i].item == name) {
                console.log("ITEM FOUND")
                const newItem = {
                    id : this.state.items[i].code,
                    item : this.state.items[i].item,
                    details : this.state.items[i].details,
                    quantity : this.state.selectedQuantity,
                    price : this.state.items[i].price
                }
                this.setState({
                    selectedItems: this.state.selectedItems.concat([newItem]),
                    total: this.state.total+ newItem.price* newItem.quantity});
            }
        }
    }

    renderItemOption() {
        var MakeItem = function(x) {
            return <option>{x.item}</option>;
        };
        return (
            <Input 
            type = "select" 
            name="select" 
            id= "itemSelect"
            onChange= {(e) => this.handleItemSelect(`${e.target.value}`)}>
               {this.state.items.map(MakeItem)} 
            </Input> 
        );
    }


    renderItemSelector(){
        return (
            <div>
                <Form>
                    <FormGroup>
                        <Label for = "itemSelect">Item</Label>
                        {this.renderItemOption()}
                        <Input placeholder="Quantity"
                        min={0} 
                        max={100} 
                        type="number" 
                        step="1" 
                        onChange= {(e) => this.handleQuantity(`${e.target.value}`)}/>
                        <Button onClick= {this.handleAddItem}>Add Item</Button>
                    </FormGroup>
                </Form>
            </div>    
        );  
    }

    render() {
        return (
            <Container>
                <Row>
                    <Col>
                        {this.renderItemSelector()}
                    </Col>
                </Row>

                <Row>
                    <Col>
                        {this.renderCart()}
                    </Col>
                </Row>
                <Row />
                <Row>
                    <Col>
                        <FormGroup>
                            <Label>Memo:   </Label><Input type= 'text'  onChange= {(e) => this.handleMemo(`${e.target.value}`)}></Input>
                        </FormGroup>
                        <FormGroup>
                            <Label>Total: ${this.state.total}</Label>
                        </FormGroup>
                        
                        <Button onClick = {this.handleSubmit} >
                            Submit Invoice
                        </Button>
                    </Col>
                </Row>
            </Container>
        );
      }
}