import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Card
} from 'semantic-ui-react'

import { createItem, deleteItem, getItems, patchItem } from '../api/items-api'
import Auth from '../auth/Auth'
import { Item } from '../types/Item'

interface ItemsProps {
  auth: Auth
  history: History
}

interface ItemsState {
  items: Item[]
  newItemName: string
  newItemDescription: string
  loadingItems: boolean
}

export class Items extends React.PureComponent<ItemsProps, ItemsState> {
  state: ItemsState = {
    items: [],
    newItemName: '',
    newItemDescription: '',
    loadingItems: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemName: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newItemDescription: event.target.value })
  }

  onEditButtonClick = (itemId: string) => {
    this.props.history.push(`/items/${itemId}/edit`)
  }

  onItemCreate = async () => {
    try {
      const date = this.calculateDate()
      const newItem = await createItem(this.props.auth.getIdToken(), {
        name: this.state.newItemName,
        description: this.state.newItemDescription,
        date
      });
      this.setState({
        items: [...this.state.items, newItem],
        newItemName: '',
        newItemDescription: ''
      })
    } catch {
      alert('Todo creation failed')
    }
  }

  onItemDelete = async (itemId: string) => {
    try {
      await deleteItem(this.props.auth.getIdToken(), itemId)
      this.setState({
        items: this.state.items.filter(item => item.itemId != itemId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const items = await getItems(this.props.auth.getIdToken())
      this.setState({
        items,
        loadingItems: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        {this.renderCreateItemInput()}
        <Header as="h1">Memories Wall</Header>
        {this.renderTodos()}
      </div>
    )
  }

  renderCreateItemInput() {
    return (
      <Card fluid>
        <Card.Content header='Add New Item' />
        <Card.Content>
            <Input fluid label='name' placeholder='My Baby Has born' onChange={this.handleNameChange}/>
            <Divider />
            <Input fluid label='description' placeholder='I named him Hamza' onChange={this.handleDescriptionChange}/>
        </Card.Content>
        <Card.Content extra>
          <Button type='button' onClick={this.onItemCreate}>Submit</Button>
        </Card.Content>
      </Card>
    )
  }

  renderTodos() {
    if (this.state.loadingItems) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Memories
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Card.Group>
        {this.state.items.map((item, pos) => {
          return (
            <Card key={item.itemId}>
              <Card.Content>
                <Image
                  floated='right'
                  size='mini'
                  src={item.attachmentUrl ? 'http://' + item.attachmentUrl : 'https://i.pravatar.cc/300'}
                />
                <Card.Header>{item.name}</Card.Header>
                <Card.Meta>{item.date}</Card.Meta>
                <Card.Description>
                  {item.description}
                </Card.Description>
              </Card.Content>
              <Card.Content extra>
                <div className='ui two buttons'>
                  <Button basic color='green' onClick={() => this.onEditButtonClick(item.itemId)}>
                    Edit
                  </Button>
                  <Button basic color='red' onClick={() => this.onItemDelete(item.itemId)}>
                    Delete
                  </Button>
                </div>
              </Card.Content>
            </Card>
          );
        })}
      </Card.Group>
    )
  }

  calculateDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
