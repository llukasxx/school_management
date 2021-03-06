class TeacherMultiReceiver extends React.Component {
  constructor(props) {
    super(props);
    this.state = {activeTab: "groups", 
                  items: {groups: new Set(), lessons: new Set(), users: new Set(),
                  groupsLoaded:false, usersLoaded:false, lessonsLoaded:false}};
    this.handleActiveTab = this.handleActiveTab.bind(this);
    this.addItem = this.addItem.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleActiveTab(e) {
    let newState = e.target.id;
    this.setState({activeTab: newState});
  }
  addItem(e) {
    let target = e.currentTarget;
    let items = this.state.items;
    switch(target.type) {
      case "group":
        items.groups.add(parseInt(target.id));
        break;
      case "lesson":
        items.lessons.add(parseInt(target.id));
        break;
      case "user":
        items.users.add(parseInt(target.id));
        break;
    }
    this.setState({items: items});
  }
  removeItem(e) {
    let target = e.currentTarget;
    let items = this.state.items;
    switch(target.type) {
      case "group":
        items.groups.delete(parseInt(target.id));
        break;
      case "lesson":
        items.lessons.delete(parseInt(target.id));
        break;
      case "user":
        items.users.delete(parseInt(target.id));
        break;
    }
    this.setState({items: items});
  }
  componentDidMount() {
    // getting grops
    $.get("/get_teacher_groups").done(function(data){
      this.setState({groups: data.groups, groupsLoaded: true});
    }.bind(this));
    // getting users
    $.get("/get_users").done(function(data){
      this.setState({users: data.teacher_dashboard, usersLoaded:true});
    }.bind(this));
    // getting lessons
    $.get("/get_lessons").done(function(data){
      this.setState({lessons: data.lessons, lessonsLoaded:true});
    }.bind(this));
  }
  handleSubmit(e) {
    e.preventDefault();
    let message = {conversation: {
                    subject: this.props.subject,
                    body: this.props.body,
                    sender_id: this.props.currentUserId,
                    receivers: {
                      groups: Array.from(this.state.items.groups),
                      lessons: Array.from(this.state.items.lessons),
                      users: Array.from(this.state.items.users)
                    }}};
    $.post('/send_new_broadcast_message', message)
      .done(function(data){
        console.log(data); 
      });
  }
  render() {
    if(this.state.groupsLoaded && this.state.usersLoaded && this.state.lessonsLoaded) {
      let tab;
      switch(this.state.activeTab) {
        case "groups":
          tab = <TeacherMessageSelectBox groups={this.state.groups}  
                addItem={this.addItem} activeTab="group" activeItems={this.state.items}/>;
          break;
        case "lessons":
          tab = <TeacherMessageSelectBox lessons={this.state.lessons}
                addItem={this.addItem} activeTab="lesson" activeItems={this.state.items}/>;
          break;
        case "individual":
          tab = <TeacherMessageSelectBox users={this.state.users}
                addItem={this.addItem} activeTab="user" activeItems={this.state.items}/>;
          break;
      }
      return(
        <div>
          <ul className="nav nav-pills">
            <li role="presentation"
              onClick={this.handleActiveTab} 
              className={this.state.activeTab == "groups" ? "active nav-links" : "nav-links"}>
              <a id="groups">Groups</a>
            </li>
            <li role="presentation"
              onClick={this.handleActiveTab}
              className={this.state.activeTab == "lessons" ? "active nav-links" : "nav-links"}>
              <a id="lessons">Lessons</a></li>
            <li role="presentation"
              onClick={this.handleActiveTab}
              className={this.state.activeTab == "individual" ? "active nav-links" : "nav-links"}>
              <a id="individual">Individual</a>
            </li>
          </ul>
          <br/>
          <div>
            {tab}
            <TeacherReceiversBox listedGroups={this.state.items.groups} 
                                 listedUsers={this.state.items.users} 
                                 listedLessons={this.state.items.lessons}
                                 groups={this.state.groups}
                                 lessons={this.state.lessons}
                                 users={this.state.users}
                                 removeItem={this.removeItem}
                                 submitForm={this.handleSubmit}/>
          </div>
        </div>
      ) 
    } else {
      return (
        <div><span className="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span></div>
      )
    }
  }
}