import Component from '@glimmer/component';

export default class UserListItemComponent extends Component {
  get initials() {
    const {
      user: {
        firstName = '',
        lastName = '',
      },
    } = this.args;

    return `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  }
}
