// withRouter.js
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const withRouter = (Component) => {
  const ComponentWithRouterProp = (props) => {
    let navigate = useNavigate();
    let location = useLocation();
    let params = useParams();
    return (
      <Component
        {...props}
        router={{ navigate, location, params }}
      />
    );
  };

  return ComponentWithRouterProp;
};

export default withRouter;
