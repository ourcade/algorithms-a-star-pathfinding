const waitForSeconds = (secs) => {
	return new Promise(resolve => {
		setTimeout(resolve, secs * 1000)
	})
}

export default waitForSeconds
