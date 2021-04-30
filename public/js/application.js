const deleteBut=document.querySelectorAll('#accordionExample a');
if (deleteBut){
deleteBut.forEach(button=>{
  button.addEventListener('click', async (e)=>{
    e.preventDefault();

const link = e.target.getAttribute('href');
    const response = await fetch(link, {
      method: 'DELETE',
    });

    const result = await response.text();
      const request=document.querySelector(`#c${result}`);
      request.remove();
  })
})
}
