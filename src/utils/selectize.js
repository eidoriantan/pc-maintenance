
import $ from 'jquery';
import '@selectize/selectize';
import '@selectize/selectize/dist/css/selectize.css';

export default function (selector, options, component) {
  const defaultOpts = {
    allowEmptyOption: true,
    onChange: function (value) {
      const state = component.state;
      const name = $(this.$input).attr('name');
      state[name] = value;
      component.setState(state);
    },
    onInitialize: function () {
      this.setValue('');
    }
  };

  $(selector).selectize({ ...defaultOpts, options });
}
