import React from 'react';

import { Button } from "react-bootstrap";

const Pagination = (props) => {
  const {currentPage, totalPages, onChangePage} = props;

  let first = null;
  if (currentPage !== 1) {
    first = <li>
      <Button onClick={() => onChangePage(1)} >Primera</Button>&nbsp;
    </li>
  }

  // let previous = null;
  // if (currentPage > 1){
  //   previous = <li>
  //       <a href="#" onClick={() => onChangePage(currentPage - 1)}>Anterior</a>
  //   </li>
  // }

  let firstPage = Math.max(1, currentPage - 5);
  let lastPage = Math.min(totalPages, firstPage + 10);
  firstPage = Math.max(1, lastPage - 10);
  let pages = [];
  for(let i = firstPage; i <= lastPage; i++) {
    if (currentPage === i)
      pages.push(<li key={i} className='active'><Button disabled >{i}</Button>&nbsp;</li>);
    else
      pages.push(<li key={i}>
          <Button onClick={() => onChangePage(i)} >{i}</Button>&nbsp;
        </li>);
  }

  // let next = null;
  // if (currentPage < totalPages) {
  //   next = <li>
  //       <a href="#" onClick={() => onChangePage(currentPage + 1)}>Próxima</a>
  //   </li>
  // }

  let last = null;
  if (currentPage < totalPages){
    last = <li>
        <Button onClick={() => onChangePage(totalPages)} >Última</Button>
    </li>
  }

  return(
    totalPages > 1 ?
      <div>
          <ul className='pagination'>
            {first}

            {pages}

            {last}
          </ul>
      </div>
    : null
  )
}

export default Pagination;
