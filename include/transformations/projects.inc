function(obj) {
	try {
		obj.managerId = mongojs.ObjectId(obj.managerId);
	} catch(err) {
		obj.managerId = null;
	}
	return obj;
}