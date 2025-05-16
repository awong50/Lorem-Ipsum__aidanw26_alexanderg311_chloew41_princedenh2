import mongoose from 'mongoose';
import User from '../models/User';
import { error } from 'console';

const userQuery = async  (username: string) => {
	try {
		const users = await User.findOne({name: username});
	return users;
	} catch (e) {
	console.log(e);
	}


};
userQuery('Test Man').then((value) => {
		console.log(value);

})
.catch((error) => {
	console.error('aa');

});
// export default userQuery;