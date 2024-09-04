import Cookies from 'js-cookie';

const getCsrfToken = () => {
  return Cookies.get('csrftoken');
};

export default getCsrfToken;