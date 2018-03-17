function(obj) {
	try {
		obj.projectId = mongojs.ObjectId(obj.projectId);
		for(var k in obj.workersIds) {
			obj.workersIds[k] = mongojs.ObjectId(obj.workersIds[k]);
		}
		for(var k in obj.dependsOnIds) {
			obj.dependsOnIds[k] = mongojs.ObjectId(obj.dependsOnIds[k]);
		}
	} catch(err) {
		obj.projectId = null;
		obj.workersIds = [];
		obj.dependsOnIds = [];
	}
	return obj;
}