import React, { Component } from 'react'
import { Alert, Dimensions, Platform, View } from 'react-native'
import { Button, Header, Icon, Input, Item, Left, Right, Text } from 'native-base'
import {UltimateListView} from 'react-native-ultimate-listview'
import { connect } from 'react-redux'

// import { UltimateListView } from '../lib/index'
import styles from './Styles/ListScreenStyles'
import LoadingSpinner from '../Components/LoadingSpinner'
import ControlTab from '../Components/ControlTab'
import FlatListItem from '../Components/FlatListItem'
import FlatListGrid from '../Components/FlatListGrid'
import UsersActions from '../Redux/Users'
import axios from 'axios'

const { width, height } = Dimensions.get('window')
class ListScreen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      layout: 'list',
      text: '',
      loaded: false,
    }
  }
  componentDidMount = async () => {
  }
  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.users !== prevProps.users) {
      this.setState({loaded: true})
    }
  }
  onFetch = async (page = 1, startFetch, abortFetch) => {
    try {
      // This is required to determinate whether the first loading list is all loaded.
      let pageLimit = 24
      if (this.state.layout === 'grid') pageLimit = 60
      const skip = (page - 1) * pageLimit

      // Generate dummy data
      // let rowData = Array.from({ length: pageLimit }, (value, index) => `item -> ${index + skip}`)


      const apiOptions = {
        method: 'GET',
        url: `http://reqres.in/api/users?page=${page}`,
      };
      try {
        const response = await axios(apiOptions)
        const users = response.data.data
        this.setState({
          isUploading: false,
          users
        });
        console.log("===api users", users)
        // this.props.getUsers(users)
        // let rowData = Array.from(this.props.users, (value, index) => value)
        let rowData = Array.from(users, (value, index) => value)
        // console.log("====rowData, users, page", rowData, users, page)
        // Simulate the end of the list if there is no more data returned from the server
        if (page === 10) {
          rowData = []
        }

        // Simulate the network loading in ES7 syntax (async/await)
        await this.sleep(2000)
        startFetch(rowData, pageLimit)
      } catch (error) {
        console.error(error);
      }

    } catch (err) {
      abortFetch() // manually stop the refresh or pagination if it encounters network error
      console.log(err)
    }
  }

  updateDataSource = async (rows) => {
      console.log("====updateDataSource rows", rows)
      // try {

      // This is required to determinate whether the first loading list is all loaded.
    //   let pageLimit = 24
    //   if (this.state.layout === 'grid') pageLimit = 60
    //   const skip = (page - 1) * pageLimit
    //
    //   // Generate dummy data
    //   // let rowData = Array.from({ length: pageLimit }, (value, index) => `item -> ${index + skip}`)
    //
    //
    //   const apiOptions = {
    //     method: 'GET',
    //     url: `http://reqres.in/api/users?page=${page}`,
    //   };
    //   try {
    //     const response = await axios(apiOptions)
    //     const users = response.data.data
    //     this.setState({
    //       isUploading: false,
    //       users
    //     });
    //     console.log("===api users", users)
    //     this.props.getUsers(users)
    //     // let rowData = Array.from(this.props.users, (value, index) => value)
    //     let rowData = Array.from(users, (value, index) => value)
    //     console.log("====rowData, users, page", rowData, users, page)
    //     // Simulate the end of the list if there is no more data returned from the server
    //     if (page === 10) {
    //       rowData = []
    //     }
    //
    //     // Simulate the network loading in ES7 syntax (async/await)
    //     await this.sleep(2000)
    //     startFetch(rowData, pageLimit)
    //   } catch (error) {
    //     console.error(error);
    //   }
    //
    // } catch (err) {
    //   abortFetch() // manually stop the refresh or pagination if it encounters network error
    //   console.log(err)
    // }
  }

  onChangeLayout = (event) => {
    this.setState({ text: '' })
    switch (event.nativeEvent.selectedSegmentIndex) {
      case 0:
        this.setState({ layout: 'list' })
        break
      case 1:
        this.setState({ layout: 'grid' })
        break
      default:
        break
    }
  }

  onChangeScrollToIndex = (num) => {
    this.setState({ text: num })
    let index = num
    if (this.state.layout === 'grid') {
      index = num / 3
    }
    try {
      this.listView.scrollToIndex({ viewPosition: 0, index: Math.floor(index) })
    } catch (err) {
      console.warn(err)
    }
  }

  onPressItem = (type, index, item) => {
    Alert.alert(type, `You're pressing on ${item}`)
  }

  sleep = time => new Promise(resolve => setTimeout(() => resolve(), time))

  renderItem = (item, index, separator) => {
    console.log("====item", item)
    if (this.state.layout === 'list') {
      return (
        <FlatListItem item={item} index={index} onPress={this.onPressItem} />
      )
    } else if (this.state.layout === 'grid') {
      return (
        <FlatListGrid item={item} index={index} onPress={this.onPressItem} />
      )
    }
    return null
  }

  renderControlTab = () => (
    <ControlTab
      layout={this.state.layout}
      onChangeLayout={this.onChangeLayout}
    />
  )

  renderHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={{ textAlign: 'center' }}>I am the Header View, you can put some Instructions or Ads Banner here!
        </Text>
      </View>
      <View style={styles.headerSegment}>
        <Left style={{ flex: 0.15 }} />
        {this.renderControlTab()}
        <Right style={{ flex: 0.15 }} />
      </View>
    </View>
  )

  renderPaginationFetchingView = () => (
    <LoadingSpinner height={height * 0.2} text="loading..." />
  )

  render() {
    return (
      <View style={styles.container}>
          <Header searchBar rounded>
            <Item style={{ backgroundColor: 'lightgray', borderRadius: 5 }}>
              <Icon name="ios-search" />
              <Input placeholder="Search" onChangeText={this.onChangeScrollToIndex} value={this.state.text} />
            </Item>
          </Header>
          <UltimateListView
            ref={ref => this.listView = ref}
            key={this.state.layout} // this is important to distinguish different FlatList, default is numColumns
            onFetch={this.onFetch}
            keyExtractor={(item, index) => `${index} - ${item}`} // this is required when you are using FlatList
            refreshableMode="advanced" // basic or advanced
            updateDataSource={this.updateDataSource}
            item={this.renderItem} // this takes three params (item, index, separator)
            numColumns={this.state.layout === 'list' ? 1 : 3} // to use grid layout, simply set gridColumn > 1

            // ----Extra Config----
            displayDate
            header={this.renderHeader}
            paginationFetchingView={this.renderPaginationFetchingView}
            // sectionHeaderView={this.renderSectionHeaderView}   //not supported on FlatList
            // paginationFetchingView={this.renderPaginationFetchingView}
            // paginationAllLoadedView={this.renderPaginationAllLoadedView}
            // paginationWaitingView={this.renderPaginationWaitingView}
            // emptyView={this.renderEmptyView}
            // separator={this.renderSeparatorView}

            // new props on v3.2.0
            arrowImageStyle={{ width: 20, height: 20, resizeMode: 'contain' }}
            dateStyle={{ color: 'lightgray' }}
            refreshViewStyle={Platform.OS === 'ios' ? { height: 80, top: -80 } : { height: 80 }}
            refreshViewHeight={80}
          />
      </View>
    )
  }
}
const mapStateToProps = (state) => {
  console.log("===redux state tree", state)
  return {
    users: state.users.users,
  }
}

const mapDispatchToProps = (dispatch) => ({
  getUsers: (payload) => dispatch(UsersActions.getUsers(payload))
})

export default connect(mapStateToProps, mapDispatchToProps)(ListScreen)
