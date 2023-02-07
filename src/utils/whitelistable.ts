import axios from 'axios';

/**
 * function keys to ignore eg : `toString` function if exists in solidity code
 */
const keysToNotCheck = ['toString'];
/**
 * Add function body without spaces here which we want to allow
 * Empty string is to ignore interface
 */
const checkFunctionsAndDefinitioins = {
  _approve: [
    '{_tokenApprovals[tokenId]=to;emitApproval(ownerOf(tokenId),to,tokenId);}',
    '{_tokenApprovals[tokenId]=to;emitApproval(ERC721.ownerOf(tokenId),to,tokenId);}',
    '{require(owner!=address(0),"ERC20:approvefromthezeroaddress");require(spender!=address(0),"ERC20:approvetothezeroaddress");_allowances[owner][spender]=amount;emitApproval(owner,spender,amount);}',
    '{_tokenApprovals[tokenId]=to;emitApproval(ERC721.ownerOf(tokenId),to,tokenId);//internalowner}',
  ],
  msgSender: [
    '{assembly{sender:=shr(96,calldataload(sub(calldatasize(),20)))}}',
  ],
  _msgSender: [
    '{returnContextMixin.msgSender();}',
    '{returnmsg.sender;}',
    '{returnpayable(msg.sender);}',
    '{returnForwarderRegistryContextBase._msgSender();}',
  ],
  add: [
    '{}',
    '',
    '{c=a+b;assert(c\\u003e=a);returnc;}',
    '{returna+b;}',
    '{uint256c=a+b;require(c>=a,"SafeMath:additionoverflow");returnc;}',
    '{return_add(set._inner,bytes32(value));}',
    '{require(!has(role,account),"Roles:accountalreadyhasrole");role.bearer[account]=true;}',
  ],
  _exists: [
    '{return_owners[tokenId]!=address(0);}',
    '{addressowner=_tokenOwner[tokenId];returnowner!=address(0);}',
    '{return_startTokenId()<=tokenId&&tokenId<_currentIndex&&_packedOwnerships[tokenId]&_BITMASK_BURNED==0;}',
    '{returntokenId<_owners.length;}',
    '{return_startTokenId()<=tokenId&&tokenId<_currentIndex&&//Ifwithinbounds,_packedOwnerships[tokenId]&_BITMASK_BURNED==0;//andnotburned.}',
    '{return_startTokenId()<=tokenId&&tokenId<_currentIndex&&!_ownerships[tokenId].burned;}',
    '{returntokenId>0&&tokenId<=getNumMinted()&&_tokens[tokenId].owner!=0x0;}',
    '{return_tokenOwners.contains(tokenId);}',
  ],

  ownerOf: [
    '{returnownershipOf(tokenId).addr;}',
    '{return_ownerOf(tokenId)!=address(0);}',
    '{addressowner=_ownerOf(tokenId);require(owner!=address(0),"ERC721:invalidtokenID");returnowner;}',
    '{addressowner=_owners[tokenId];require(owner!=address(0),"ERC721:ownerqueryfornonexistenttoken");returnowner;}',
    '{require(_exists(tokenId),"ERC721:ownerqueryfornonexistenttoken");returnaddress(_tokens[tokenId].owner);}',
    '{addressowner=_owners[tokenId];require(owner!=address(0),"ERC721:invalidtokenID");returnowner;}',
    '{require(_exists(tokenId),"ERC721:ownerqueryfornonexistenttoken");returnaddress(_tokens[tokenId].owner);}',
    '{returnaddress(uint160(_packedOwnershipOf(tokenId)));}',
    '{require(expiries[tokenId]>now);returnsuper.ownerOf(tokenId);}',
    '{uint256owner=s.owners[tokenId];require(_tokenExists(owner),"ERC721:non-existingtoken");return_tokenOwner(owner);}',
    '{return_tokenOwners.get(tokenId,"ERC721:ownerqueryfornonexistenttoken");}',
    '{returnnfOwners[_id];}',
    '{if(!_exists(tokenId))revertOwnerQueryForNonexistentToken();//Cannotrealisticallyoverflow,sinceweareusinguint256unchecked{for(tokenId;;tokenId++){if(_owners[tokenId]!=address(0)){return_owners[tokenId];}}}revertUnableDetermineTokenOwner();}',
  ],
  _checkOnERC721Received: [
    '{if(to.isContract()){tryIERC721Receiver(to).onERC721Received(_msgSender(),from,tokenId,data)returns(bytes4retval){returnretval==IERC721Receiver.onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0){revert("ERC721:transfertononERC721Receiverimplementer");}else{///@soliditymemory-safe-assemblyassembly{revert(add(32,reason),mload(reason))}}}}else{returntrue;}}',
    '{if(to.isContract()){tryIERC721Receiver(to).onERC721Received(_msgSender(),from,tokenId,data)returns(bytes4retval){returnretval==IERC721Receiver.onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0){revert("ERC721:transfertononERC721Receiverimplementer");}else{assembly{revert(add(32,reason),mload(reason))}}}}else{returntrue;}}',
    '{if(to.isContract()){tryIERC721Receiver(to).onERC721Received(_msgSender(),from,tokenId,_data)returns(bytes4retval){returnretval==IERC721Receiver.onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0){revert("ERC721:transfertononERC721Receiverimplementer");}else{assembly{revert(add(32,reason),mload(reason))}}}}else{returntrue;}}',
    '{if(!to.isContract()){returntrue;}bytes4retval=IERC721Receiver(to).onERC721Received(msg.sender,from,tokenId,_data);return(retval==_ERC721_RECEIVED);}',
    '{if(to.code.length==0)returntrue;tryIERC721Receiver(to).onERC721Received(msg.sender,from,tokenId,_data)returns(bytes4retval){returnretval==IERC721Receiver(to).onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0)revertTransferToNonERC721ReceiverImplementer();assembly{revert(add(32,reason),mload(reason))}}}',
    '{if(to.isContract()){tryIERC721Receiver(to).onERC721Received(_msgSender(),from,tokenId,_data)returns(bytes4retval){returnretval==IERC721Receiver.onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0){revert("ERC721:transfertononERC721Receiverimplementer");}else{assembly{revert(add(32,reason),mload(reason))}}}}returntrue;}',
    '{if(to.isContract()){tryIERC721Receiver(to).onERC721Received(_msgSender(),from,tokenId,_data)returns(bytes4retval){returnretval==IERC721Receiver(to).onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0){revert("ERC721:transfertononERC721Receiverimplementer");}else{//solhint-disable-next-lineno-inline-assemblyassembly{revert(add(32,reason),mload(reason))}}}}else{returntrue;}}',
    '{if(!to.isContract()){returntrue;}bytesmemoryreturndata=to.functionCall(abi.encodeWithSelector(IERC721Receiver(to).onERC721Received.selector,_msgSender(),from,tokenId,_data),"ERC721:transfertononERC721Receiverimplementer");bytes4retval=abi.decode(returndata,(bytes4));return(retval==_ERC721_RECEIVED);}',
    '{if(to.isContract()){tryIERC721Receiver(to).onERC721Received(_msgSender(),from,tokenId,_data)returns(bytes4retval){returnretval==IERC721Receiver(to).onERC721Received.selector;}catch(bytesmemoryreason){if(reason.length==0){revert("ERC721:transfertononERC721Receiverimplementer");}else{assembly{revert(add(32,reason),mload(reason))}}}}else{returntrue;}}',
  ],

  safeTransferFrom: [
    '',
    '{_transfer(from,to,tokenId);if(to.isContract()&&!_checkContractOnERC721Received(from,to,tokenId,_data)){revertTransferToNonERC721ReceiverImplementer();}}',
    '{require(from==_msgSender()||isApprovedForAll(from,_msgSender()),"ERC1155:callerisnotownernorapproved");_safeTransferFrom(from,to,id,amount,data);}',
    '{require(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:callerisnottokenownernorapproved");_safeTransfer(from,to,tokenId,data);}',
    '{require(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:callerisnottokenownerorapproved");_safeTransfer(from,to,tokenId,data);}',
    '{require(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:transfercallerisnotownernorapproved");_safeTransfer(from,to,tokenId,_data);}',
    '{transferFrom(from,to,tokenId);require(_checkOnERC721Received(from,to,tokenId,_data));}',
    '{transferFrom(from,to,tokenId);if(to.code.length!=0)if(!_checkContractOnERC721Received(from,to,tokenId,_data)){revertTransferToNonERC721ReceiverImplementer();}}',
    '{transferFrom(from,to,id);if(!_checkOnERC721Received(from,to,id,data))revertTransferToNonERC721ReceiverImplementer();}',
    '{_callOptionalReturn(token,abi.encodeWithSelector(token.transferFrom.selector,from,to,value));}',
    '{\\rrequire(\\rfrom==_msgSender()||isApprovedForAll(from,_msgSender()),\\r"ERC1155:callerisnottokenownernorapproved"\\r);\\r_safeTransferFrom(from,to,id,amount,data);\\r}',
    '{require(from==_msgSender()||isApprovedForAll(from,_msgSender()),"ERC1155:callerisnottokenownerorapproved");_safeTransferFrom(from,to,id,amount,data);}',
    '{require(from==_msgSender()||isApprovedForAll(from,_msgSender()),"ERC1155:callerisnottokenownernorapproved");_safeTransferFrom(from,to,id,amount,data);}',
    '{require(_to!=address(0x0),"cannotsendtozeroaddress");require(_from==msg.sender||operatorApproval[_from][msg.sender]==true,"Needoperatorapprovalfor3rdpartytransfers.");if(isNonFungible(_id)){require(nfOwners[_id]==_from);nfOwners[_id]=_to;uint256baseType=getNonFungibleBaseType(_id);balances[baseType][_from]=balances[baseType][_from].sub(_value);balances[baseType][_to]=balances[baseType][_to].add(_value);}else{balances[_id][_from]=balances[_id][_from].sub(_value);balances[_id][_to]=balances[_id][_to].add(_value);}emitTransferSingle(msg.sender,_from,_to,_id,_value);if(_to.isContract()){_doSafeTransferAcceptanceCheck(msg.sender,_from,_to,_id,_value,_data);}}',
  ],
  _isApprovedOrOwner: [
    '',
    '{addressowner=ERC721.ownerOf(tokenId);return(spender==owner||isApprovedForAll(owner,spender)||getApproved(tokenId)==spender);}',
    '{require(_exists(tokenId),"ERC721:operatorqueryfornonexistenttoken");addressowner=ERC721.ownerOf(tokenId);return(spender==owner||getApproved(tokenId)==spender||ERC721.isApprovedForAll(owner,spender));}',
    '{require(_exists(tokenId),"ERC721:operatorqueryfornonexistenttoken");addressowner=ERC721.ownerOf(tokenId);return(spender==owner||getApproved(tokenId)==spender||isApprovedForAll(owner,spender));}',
    '{addressowner=ownerOf(tokenId);return(spender==owner||getApproved(tokenId)==spender||isApprovedForAll(owner,spender));}',
    '{require(_exists(tokenId),"ERC721:operatorqueryfornonexistenttoken");addressowner=ERC721.ownerOf(tokenId);return(spender==owner||isApprovedForAll(owner,spender)||getApproved(tokenId)==spender);}',
    '{require(_exists(tokenId),"ERC721:operatorqueryfornonexistenttoken");addressowner=ownerOf(tokenId);return(spender==owner||getApproved(tokenId)==spender||isApprovedForAll(owner,spender));}',
  ],
  isApprovedForAll: [
    '',
    '{\\rreturn_operatorApprovals[account][operator];\\r}',
    '{return_operatorApprovals[account][operator];}',
    '{return_operatorApprovals[owner][operator];}',
    '{returns.operators[owner][operator];}',
    '{returnoperatorApproval[_owner][_operator];}',
  ],
  getApproved: [
    '',
    '{_requireMinted(tokenId);return_tokenApprovals[tokenId];}',
    '{require(_exists(tokenId),"ERC721:approvedqueryfornonexistenttoken");return_tokenApprovals[tokenId];}',
    '{require(_exists(tokenId));return_tokenApprovals[tokenId];}',
    '{if(!_exists(tokenId))revertApprovalQueryForNonexistentToken();return_tokenApprovals[tokenId].value;}',
    '{if(!_exists(tokenId))revertApprovalQueryForNonexistentToken();return_tokenApprovals[tokenId];}',
    '{if(!_exists(tokenId))revertApprovalQueryForNonexistentToken();return_tokenApprovals[tokenId].value;}',
    '{if(!_exists(tokenId))revertApprovalQueryForNonexistentToken();return_tokenApprovals[tokenId];}',
    '{uint256owner=s.owners[tokenId];require(_tokenExists(owner),"ERC721:non-existingtoken");if(_tokenHasApproval(owner)){returns.approvals[tokenId];}else{returnaddress(0);}}',
  ],
  _safeTransfer: [
    '',
    '{_transfer(from,to,tokenId);require(_checkOnERC721Received(from,to,tokenId,data),"ERC721:transfertononERC721Receiverimplementer");}',
    '{_transfer(from,to,tokenId);require(_checkOnERC721Received(from,to,tokenId,_data),"ERC721:transfertononERC721Receiverimplementer");}',
  ],
  _transfer: [
    '',
    '{}',
    '{require(ERC721.ownerOf(tokenId)==from,"ERC721:transferoftokenthatisnotown");require(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId);_approve(address(0),tokenId);_balances[from]-=1;_balances[to]+=1;_owners[tokenId]=to;emitTransfer(from,to,tokenId);}',
    '{require(ERC721.ownerOf(tokenId)==from,"ERC721:transferfromincorrectowner");require(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId);//Clearapprovalsfromthepreviousowner_approve(address(0),tokenId);_balances[from]-=1;_balances[to]+=1;_owners[tokenId]=to;emitTransfer(from,to,tokenId);_afterTokenTransfer(from,to,tokenId);}',
    '{require(ERC721.ownerOf(tokenId)==from,"ERC721:transferfromincorrectowner");require(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId);_approve(address(0),tokenId);_balances[from]-=1;_balances[to]+=1;_owners[tokenId]=to;emitTransfer(from,to,tokenId);_afterTokenTransfer(from,to,tokenId);}',
    '{require(ERC721.ownerOf(tokenId)==from,"ERC721:transferfromincorrectowner");require(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId,1);require(ERC721.ownerOf(tokenId)==from,"ERC721:transferfromincorrectowner");delete_tokenApprovals[tokenId];unchecked{_balances[from]-=1;_balances[to]+=1;}_owners[tokenId]=to;emitTransfer(from,to,tokenId);_afterTokenTransfer(from,to,tokenId,1);}',
    '{require(isOwnerOf(from,tokenId),"ERC721:transferoftokenthatisnotown");require(to!=address(0),"ERC721:transfertothezeroaddress");_approve(address(0),tokenId);_balances[from]-=1;_balances[to]+=1;_tokens[tokenId].owner=uint160(to);emitTransfer(from,to,tokenId);}',
    '{require(ERC721.ownerOf(tokenId)==from,"ERC721:transferoftokenthatisnotown");require(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId);//Clearapprovalsfromthepreviousowner_approve(address(0),tokenId);_balances[from]-=1;_balances[to]+=1;_owners[tokenId]=to;emitTransfer(from,to,tokenId);}',
    '{require(from!=address(0),"ERC20:transferfromthezeroaddress");require(to!=address(0),"ERC20:transfertothezeroaddress");_beforeTokenTransfer(from,to,amount);uint256fromBalance=_balances[from];require(fromBalance>=amount,"ERC20:transferamountexceedsbalance");unchecked{_balances[from]=fromBalance-amount;}_balances[to]+=amount;emitTransfer(from,to,amount);_afterTokenTransfer(from,to,amount);}',
    '{require(ERC721.ownerOf(tokenId)==from,"ERC721:transferoftokenthatisnotown");//internalownerrequire(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId);//Clearapprovalsfromthepreviousowner_approve(address(0),tokenId);_holderTokens[from].remove(tokenId);_holderTokens[to].add(tokenId);_tokenOwners.set(tokenId,to);emitTransfer(from,to,tokenId);',
    '{require(ERC721.ownerOf(tokenId)==from,"ERC721:transferoftokenthatisnotown");//internalownerrequire(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId);//Clearapprovalsfromthepreviousowner_approve(address(0),tokenId);_holderTokens[from].remove(tokenId);_holderTokens[to].add(tokenId);_tokenOwners.set(tokenId,to);emitTransfer(from,to,tokenId);}',
    '{require(ownerOf(tokenId)==from,"ERC721:transferoftokenthatisnotown");require(to!=address(0),"ERC721:transfertothezeroaddress");_beforeTokenTransfer(from,to,tokenId);//Clearapprovalsfromthepreviousowner_approve(address(0),tokenId);_holderTokens[from].remove(tokenId);_holderTokens[to].add(tokenId);_tokenOwners.set(tokenId,to);emitTransfer(from,to,tokenId);}',
  ],
  _beforeTokenTransfer: [
    '',
    '{super._beforeTokenTransfer(operator,from,to,ids,amounts,data);if(from==address(0)){for(uint256i=0;i<ids.length;++i){_totalSupply[ids[i]]+=amounts[i];}}if(to==address(0)){for(uint256i=0;i<ids.length;++i){uint256id=ids[i];uint256amount=amounts[i];uint256supply=_totalSupply[id];require(supply>=amount,"ERC1155:burnamountexceedstotalSupply");unchecked{_totalSupply[id]=supply-amount;}}}}',
    '{super._beforeTokenTransfer(operator,from,to,ids,amounts,data);}',
    '{\\rsuper._beforeTokenTransfer(operator,from,to,ids,amounts,data);\\r}',
    '{super._beforeTokenTransfer(operator,from,to,ids,amounts,data);require(!paused(),"ERC1155Pausable:tokentransferwhilepaused");}',
    '{}',
    '{super._beforeTokenTransfer(from,to,tokenId);}',
    '{if(batchSize>1){if(from!=address(0)){_balances[from]-=batchSize;}if(to!=address(0)){_balances[to]+=batchSize;}}}',
    '{ERC721Enumerable._beforeTokenTransfer(from,to,tokenId);}',
    '{super._beforeTokenTransfer(from,to,tokenId);if(from==address(0)){_addTokenToAllTokensEnumeration(tokenId);}elseif(from!=to){_removeTokenFromOwnerEnumeration(from,tokenId);}if(to==address(0)){_removeTokenFromAllTokensEnumeration(tokenId);}elseif(to!=from){_addTokenToOwnerEnumeration(to,tokenId);}}',
    '{super._beforeTokenTransfer(from,to,tokenId);}',
    '{super._beforeTokenTransfer(from,to,tokenId);require(!paused(),"ERC721Pausable:tokentransferwhilepaused");}',
  ],
  transferFrom: [
    '{require(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:transfercallerisnotownernorapproved");_transfer(from,to,tokenId);}',
    '{require(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:callerisnottokenownernorapproved");_transfer(from,to,tokenId);}',
    '{require(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:callerisnottokenownernorapproved");_transfer(from,to,tokenId);}',
    '{//solhint-disable-next-linemax-line-lengthrequire(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:callerisnottokenownernorapproved");_transfer(from,to,tokenId);}',
    '{//solhint-disable-next-linemax-line-lengthrequire(_isApprovedOrOwner(_msgSender(),tokenId),"ERC721:transfercallerisnotownernorapproved");_transfer(from,to,tokenId);}',
    '{addressspender=_msgSender();_spendAllowance(from,spender,amount);_transfer(from,to,amount);returntrue;}',
    '{require(to!=address(0),"ERC721:transfertoaddress(0)");uint256owner=s.owners[tokenId];require(_tokenExists(owner),"ERC721:non-existingtoken");require(_tokenOwner(owner)==from,"ERC721:non-ownedtoken");if(!_isOperatable(s,from,sender)){require(_tokenHasApproval(owner)&&sender==s.approvals[tokenId],"ERC721:non-approvedsender");}s.owners[tokenId]=uint256(uint160(to));if(from!=to){unchecked{--s.balances[from];++s.balances[to];}}emitTransfer(from,to,tokenId);}',
  ],
  _packedOwnershipOf: [
    '{}',
    '',
    '{uint256curr=tokenId;unchecked{if(_startTokenId()<=curr)if(curr<_currentIndex){uint256packed=_packedOwnerships[curr];if(packed&_BITMASK_BURNED==0){while(packed==0){packed=_packedOwnerships[--curr];}returnpacked;}}}revertOwnerQueryForNonexistentToken();}',
  ],
  isContract: [
    '{uint256size;assembly{size:=extcodesize(account)}returnsize>0;}',
    '{returnaccount.code.length>0;}',
    '{//Thismethodreliesonextcodesize/address.code.length,whichreturns0//forcontractsinconstruction,sincethecodeisonlystoredattheend//oftheconstructorexecution.returnaccount.code.length>0;}',
    '{//Thismethodreliesonextcodesize,whichreturns0forcontractsin//construction,sincethecodeisonlystoredattheendofthe//constructorexecution.uint256size;assembly{size:=extcodesize(account)}returnsize>0;}',
    '{//Thismethodreliesonextcodesize,whichreturns0forcontractsin//construction,sincethecodeisonlystoredattheendofthe//constructorexecution.uint256size;//solhint-disable-next-lineno-inline-assemblyassembly{size:=extcodesize(account)}returnsize>0;}',
    '{\\t\\t\\t\\tuint256size=0;\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\t\\tassembly{\\t\\t\\t\\t\\t\\tsize:=extcodesize(addr)\\t\\t}\\t\\t\\t\\treturnsize>0;\\t}',
    `{uint256size;assembly{size:=extcodesize(account)}returnsize\\u003e0;}`,
  ],
  _requireMinted: ['{require(_exists(tokenId),"ERC721:invalidtokenID");}'],
  getNumMinted: ['{return_tokens.length-1;}'],
  _ownerOf: ['{return_owners[tokenId];}'],
  revertOwnerQueryForNonexistentToken: [''],
  revertUnableDetermineTokenOwner: [''],
  get: ['', '{}'],
  _tokenOwner: ['', '{}'],
  ownershipOf: ['', '{}'],
  functionCall: [
    '',
    '{}',
    '{returnfunctionCallWithValue(target,data,0,errorMessage);}',
  ],
  functionCallWithValue: [
    '',
    '{}',
    '{require(address(this).balance>=value,"Address:insufficientbalanceforcall");(boolsuccess,bytesmemoryreturndata)=target.call{value:value}(data);returnverifyCallResultFromTarget(target,success,returndata,errorMessage);}',
    '{require(address(this).balance>=value,"Address:insufficientbalanceforcall");require(isContract(target),"Address:calltonon-contract");(boolsuccess,bytesmemoryreturndata)=target.call{value:value}(data);returnverifyCallResult(success,returndata,errorMessage);}',
  ],
  encodeWithSelector: ['', '{}'],
  verifyCallResultFromTarget: [
    '',
    '{if(success){if(returndata.length==0){//onlycheckisContractifthecallwassuccessfulandthereturndataisempty//otherwisewealreadyknowthatitwasacontractrequire(isContract(target),"Address:calltonon-contract");}returnreturndata;}else{_revert(returndata,errorMessage);}}',
    '{}',
    '{if(success){if(returndata.length==0){require(isContract(target),"Address:calltonon-contract");}returnreturndata;}else{_revert(returndata,errorMessage);}}',
  ],
  _revert: [
    '',
    '{//Lookforrevertreasonandbubbleitupifpresentif(returndata.length>0){//Theeasiestwaytobubbletherevertreasonisusingmemoryviaassembly///@soliditymemory-safe-assemblyassembly{letreturndata_size:=mload(returndata)revert(add(32,returndata),returndata_size)}}else{revert(errorMessage);}}',
    '{}',
    '{if(returndata.length>0){assembly{letreturndata_size:=mload(returndata)revert(add(32,returndata),returndata_size)}}else{revert(errorMessage);}}',
  ],
  _callOptionalReturn: ['', '{}'],
  _safeTransferFrom: [
    '',
    '{\\rrequire(to!=address(0),"ERC1155:transfertothezeroaddress");\\r\\raddressoperator=_msgSender();\\ruint256[]memoryids=_asSingletonArray(id);\\ruint256[]memoryamounts=_asSingletonArray(amount);\\r\\r_beforeTokenTransfer(operator,from,to,ids,amounts,data);\\r\\ruint256fromBalance=_balances[id][from];\\rrequire(\\rfromBalance>=amount,\\r"ERC1155:insufficientbalancefortransfer"\\r);\\runchecked{\\r_balances[id][from]=fromBalance-amount;\\r}\\r_balances[id][to]+=amount;\\r\\remitTransferSingle(operator,from,to,id,amount);\\r\\r_afterTokenTransfer(operator,from,to,ids,amounts,data);\\r\\r_doSafeTransferAcceptanceCheck(operator,from,to,id,amount,data);\\r}',
    '{}',
    '{require(to!=address(0),"ERC1155:transfertothezeroaddress");addressoperator=_msgSender();uint256[]memoryids=_asSingletonArray(id);uint256[]memoryamounts=_asSingletonArray(amount);_beforeTokenTransfer(operator,from,to,ids,amounts,data);uint256fromBalance=_balances[id][from];require(fromBalance>=amount,"ERC1155:insufficientbalancefortransfer");unchecked{_balances[id][from]=fromBalance-amount;}_balances[id][to]+=amount;emitTransferSingle(operator,from,to,id,amount);_afterTokenTransfer(operator,from,to,ids,amounts,data);_doSafeTransferAcceptanceCheck(operator,from,to,id,amount,data);}',
  ],
  _asSingletonArray: [
    '',
    '{\\ruint256[]memoryarray=newuint256[](1);\\rarray[0]=element;\\r\\rreturnarray;\\r}',
    '{}',
    '{uint256[]memoryarray=newuint256[](1);array[0]=element;returnarray;}',
  ],
  _doSafeTransferAcceptanceCheck: [
    '',
    '{}',
    '{\\rif(to.isContract()){\\rtry\\rIERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data)\\rreturns(bytes4response){\\rif(response!=IERC1155Receiver.onERC1155Received.selector){\\rrevert("ERC1155:ERC1155Receiverrejectedtokens");\\r}\\r}catchError(stringmemoryreason){\\rrevert(reason);\\r}catch{\\rrevert("ERC1155:transfertononERC1155Receiverimplementer");\\r}\\r}\\r}',

    '{require(ERC1155TokenReceiver(_to).onERC1155Received(_operator,_from,_id,_value,_data)==ERC1155_ACCEPTED,"contractreturnedanunknownvaluefromonERC1155Received");}',
    '{if(to.isContract()){tryIERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data)returns(bytes4response){if(response!=IERC1155Receiver.onERC1155Received.selector){revert("ERC1155:ERC1155Receiverrejectedtokens");}}catchError(stringmemoryreason){revert(reason);}catch{revert("ERC1155:transfertonon-ERC1155Receiverimplementer");}}}',
    '{if(to.isContract()){tryIERC1155Receiver(to).onERC1155Received(operator,from,id,amount,data)returns(bytes4response){if(response!=IERC1155Receiver.onERC1155Received.selector){revert("ERC1155:ERC1155Receiverrejectedtokens");}}catchError(stringmemoryreason){revert(reason);}catch{revert("ERC1155:transfertononERC1155Receiverimplementer");}}}',
  ],
  onERC1155Received: ['', '{}'],
  catchError: ['', '{}'],
  _tokenExists: ['', '{}'],
  _tokenHasApproval: ['', '{}'],
  extcodesize: ['', '{}'],
  tryIERC721Receiver: ['{}', ''],
  onERC721Received: ['{}', ''],
  _spendAllowance: ['', '{}'],
  _checkContractOnERC721Received: ['', '{}'],
  revertTransferToNonERC721ReceiverImplementer: ['{}', ''],
  IERC721Receiver: ['{}', ''],
  _startTokenId: ['{}', '', '{return0;}'],
  _add: [
    '',
    '{}',
    '{if(!_contains(set,value)){set._values.push(value);set._indexes[value]=set._values.length;returntrue;}else{returnfalse;}}',
  ],
  mload: ['{}', ''],
  revert: ['{}', ''],
  revertApprovalQueryForNonexistentToken: ['{}', ''],
  contains: ['', '{}', '{return_contains(set._inner,bytes32(value));}'],
  startTokenId: ['', '{}'],
  return_startTokenId: ['', '{}'],
  returntokenId: ['', '{}'],
  require: ['', '{}'],
  calldataload: ['', '{}'],
  sub: [
    '',
    '{}',
    '{assert(b\\u003c=a);returna-b;}',
    '{assert(b<=a);returna-b;}',
    '{unchecked{require(b<=a,errorMessage);returna-b;}}',
  ],
  calldatasize: ['', '{}'],
  shr: ['', '{}'],
  emitApproval: ['', '{}'],
  return_ownerOf: ['', '{}'],
  returnpayable: ['', '{}'],
  returnownershipOf: ['', '{}'],
  returnaddress: ['', '{}'],
  returns: ['', '{}'],
  decode: ['', '{}'],
  emitTransfer: ['', '{}'],
  isOwnerOf: ['', '{}'],
  paused: [
    '',
    '{}',
    '{return_paused;}',
    '{\\rfor(uint256id;id<items.length;id++){\\ritems[id].isPaused=_isPaused;\\r}\\r}',
  ],
  _addTokenToAllTokensEnumeration: ['', '{}'],
  _removeTokenFromOwnerEnumeration: ['', '{}'],
  _isOperatable: ['', '{}'],
  transfertoaddress: ['', '{}'],
  return_add: ['', '{}'],
  payable: ['', '{}'],
  ForwarderRegistryContextBase: ['', '{}'],
  remove: ['', '{}', '{return_remove(set._inner,bytes32(value));}'],
  set: ['', '{}'],
  uint256: ['', '{}'],
  _afterTokenTransfer: ['', '{}'],
  return_tokenOwner: ['', '{}'],
  Clearapprovalsfromthepreviousowner_approve: ['', '{}'],
  approvalsfromthepreviousowner_approve: ['', '{}'],
  internalownerrequire: ['', '{}'],
  ownerrequire: ['', '{}'],
  elseif: ['', '{}'],
  lengthrequire: ['', '{}'],
};

function extractFunctions(str: string) {
  let functions: string[] = [];
  let stack: string[] = [];
  let start = false;

  for (let i = 0; i < str.length; i++) {
    if (str.substring(i, i + 9) === 'function ') {
      start = true;
    }

    if (start) {
      let semiColonIndex = str.indexOf(';', i);
      let forwardBracesIndex = str.indexOf('{', i);

      if (semiColonIndex !== -1 && semiColonIndex < forwardBracesIndex) {
        if (i < semiColonIndex) i = semiColonIndex + 1;
        console.log('Interface found', i, semiColonIndex, forwardBracesIndex);
        start = false;
        continue;
      }

      let myFunc = '';
      do {
        if (str[i] == '{') {
          stack.push('str');
        } else if (str[i] == '}') {
          stack.pop();
        }
        myFunc = myFunc.concat(str[i]);
        i++;
      } while (stack.length || i <= forwardBracesIndex);
      functions.push(myFunc);
      start = false;
    }
  }

  return functions;
}

/**
 * Function to extract body of function
 * @param str function that we want to extract body of
 * @returns function body
 */
function extractFunctionBody(str: string) {
  let stack = [];
  let start = -1;
  let end = -1;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{') {
      if (stack.length === 0) {
        start = i;
      }
      //   @ts-ignore
      stack.push(str[i]);
    } else if (str[i] === '}') {
      stack.pop();
      if (stack.length === 0) {
        end = i;
        break;
      }
    }
  }
  return str.slice(start, end + 1);
}

/**
 * Function to check if contract is whitelistable or not
 * @param explorerApi explorer api to use for
 * @param contractAddress the contract address to check
 * @param apiKey api key of explorer api
 * @returns A boolean, true if all test cases passes false if none pass
 */

export const isWhitelistable = async (
  explorerApi: string,
  contractAddress: string,
  apiKey: string
) => {
  const data = await axios.get(
    `${explorerApi}/api?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${apiKey}`
  );

  /**
   * If not verified return false
   */

  if (data.status !== 200) return false;

  const doubleSlashCommentsRegex = /\/\/.*?(\\n)/g;
  const nextLineRegex = /\n/g;
  const nextLineWithDoubleSlashRegex = /\\n/g;
  const tabRgex = /\r/g;
  const tabRgex_ = /\t/g;
  const escapeSlashRegex = /\\"/g;
  const blockCommentsRegex = /\/\*[\s\S]*?\*\//g;
  const functionNamesRegex = /(function|constructor)\s+(\w+)\s*\(/;
  const spaceRegex = /\s/g;

  let sourceCode = data.data.result[0].SourceCode;
  let contractName = data.data.result[0].ContractName;
  console.log('Contract Name = ', contractName);
  if (sourceCode === '') {
    return false;
  }
  sourceCode = sourceCode
    .replace(doubleSlashCommentsRegex, '')
    .replace(blockCommentsRegex, '')
    .replace(nextLineRegex, '')
    .replace(escapeSlashRegex, '"')
    .replace(tabRgex, '')
    .replace(tabRgex_, '')
    .replace(nextLineWithDoubleSlashRegex, '');

  /**
   * if is upgradeable, return false
   */

  if (
    sourceCode.includes('Upgradeable') ||
    sourceCode.includes('upgradeable') ||
    sourceCode.includes('Proxy') ||
    sourceCode.includes('proxy')
  )
    return false;

  const matches = extractFunctions(sourceCode);

  console.log(matches);

  let functions: Record<string, string> = {};

  if (matches) {
    matches.forEach((match: string) => {
      console.log({ match });

      const funcName = match.match(functionNamesRegex)![2];
      const funcBody = extractFunctionBody(match).replace(spaceRegex, '');
      functions[funcName] = funcBody;
    });
  }

  let isVerified = true;

  for (let [functionName, functionBody] of Object.entries(functions)) {
    if (functionName == 'msgSender')
      console.log('asd', functionBody, functionName);
    if (
      //@ts-ignore
      checkFunctionsAndDefinitioins[functionName] &&
      !keysToNotCheck.includes(functionName)
    ) {
      console.log(functionName, functionBody);
      if (
        //@ts-ignore
        checkFunctionsAndDefinitioins[functionName].indexOf(functionBody) == -1
      ) {
        isVerified = false;
        break;
      }
    }
  }

  return isVerified;
};
