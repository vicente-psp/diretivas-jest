import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TarefasService, ITarefa, StatusEnum } from './tarefas.service';

@Component({
  selector: 'app-tarefas',
  templateUrl: './tarefas.component.html',
  styleUrls: ['./tarefas.component.scss']
})
export class TarefasComponent implements OnInit {

  CADASTRAR_TAREFA = 'Cadastrar tarefa';
  EDITAR_TAREFA = 'Editar tarefa';
  titleForm = this.CADASTRAR_TAREFA;
  displayedColumns = ['id', 'descricao', 'observacao', 'dataCriacao', 'dataModificacao', 'status', 'acoes'];
  list: ITarefa[] = [];
  tarefa: ITarefa = { descricao: '', observacao: '' };
  form = this._formBuilder.group({
    id: new FormControl<string | number>({ value: '', disabled: true }),
    descricao: ['', [Validators.required]],
    observacao: [''],
    status: new FormControl<StatusEnum>(StatusEnum.PENDENTE)
  });
  statusList = [
    { value: StatusEnum.PENDENTE, description: 'pendente' },
    { value: StatusEnum.FAZENDO, description: 'fazendo' },
    { value: StatusEnum.FEITO, description: 'feito' },
    { value: StatusEnum.CANCELADO, description: 'cancelado' },
  ];
  isLoadingSalvar = false;
  isLoadingListar = false;
  statusEnum = StatusEnum;

  constructor(
    private tarefasService: TarefasService,
    private _formBuilder: FormBuilder,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.listar();
  }

  openSnackBar(mensagem: string) {
    this._snackBar.open(mensagem, 'Fechar', {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      duration: 15000
    });
  }

  listar(): void {
    this.isLoadingListar = true;
    this.tarefasService.listar().subscribe(
      data => {
        this.list = data;
        this.isLoadingListar = false;
      },
      () => {
        this.isLoadingListar = false;
        this.openSnackBar(`Houve algum erro ao tentar listar as tarefas`);
      }
    );
  }

  listarClick(): void {
    this.listar();
  }

  getStatusEnum(statusForm: FormControl): StatusEnum {
    if (statusForm) {
      return statusForm.value;
    }
    return StatusEnum.PENDENTE;
  }

  limparClick(): void {
    this.form.reset();
    this.titleForm = this.CADASTRAR_TAREFA;
  }

  salvarClick(): void {
    if (this.form.invalid) {
      return;
    }
    this.form.disable();
    this.isLoadingSalvar = true;
    const { id, descricao, observacao, status } = this.form.controls;

    const tarefa: ITarefa = {
      descricao: descricao.value || '',
      observacao: observacao.value || '',
      status: null
    }

    if (id.value && id.value?.toString() !== '') {
      const statusEnum = this.getStatusEnum(status);
      this.tarefa.status = statusEnum;
      this.tarefa.descricao = descricao.value || '';
      this.tarefa.observacao = observacao.value || '';
      this.tarefasService.editar(this.tarefa).subscribe(
        () => {
          this.listar();
          this.clearForm();
          this.form.controls.status.setValue(StatusEnum.PENDENTE);
        },
        () => {
          this.isLoadingSalvar = false;
          this.openSnackBar(`Houve algum erro ao tentar editar a tarefa de id nº ${this.tarefa.id}`);
        }
        );
      } else {
        this.tarefasService.salvar(tarefa).subscribe(
          () => {
            this.listar();
            this.clearForm();
          },
          () => {
            this.isLoadingSalvar = false;
            this.openSnackBar(`Houve algum erro ao tentar criar uma nova tarefa`);
          }
      );
    }
  }

  clearForm(): void {
    this.form.reset();
    this.isLoadingSalvar = false;
    this.titleForm = this.CADASTRAR_TAREFA;
    this.form.enable();
    this.form.controls.id.disable();
  }

  editarClick(tarefa: ITarefa): void {
    if (!tarefa?.id) {
      return;
    }
    this.setTarefa(tarefa.id);
  }

  private setTarefa(id: string | number): void {
    this.tarefasService.getById(id).subscribe(
      tarefa => {
        this.tarefa = tarefa;
        this.form.setValue({
          id,
          descricao: tarefa.descricao,
          observacao: tarefa.observacao,
          status: tarefa?.status || StatusEnum.PENDENTE
        });
      },
      () => {
        this.openSnackBar(`Houve algum erro ao tentar buscar a tarefa de id nº ${id}`);
      }
    );
  }

  removerClick(tarefa: ITarefa): void {
    this.tarefasService.remover(tarefa).subscribe(
      () => this.listar(),
      () => {
        this.openSnackBar(`Houve algum erro ao tentar remover a tarefa de id nº ${tarefa.id}`);
      }
    );
  }

  alterarStatusClick(tarefa: ITarefa, status: StatusEnum): void {
    if (!tarefa.id) {
      return;
    }
    this.tarefasService.alterarStatus(tarefa.id, status).subscribe(
      () => this.listar(),
      () => {
        this.openSnackBar(`Houve algum erro ao tentar alterar a tarefa de id nº ${tarefa.id}`);
      }
    );
  }

  getNgClass(status: StatusEnum) {
    console.log('status => ', status);
    return '';
    if (status === StatusEnum.PENDENTE) {
      return 'circle--pendente';
    }
    if (status === StatusEnum.FAZENDO) {
      return 'circle--fazendo';
    }
    if (status === StatusEnum.FEITO) {
      return 'circle--feito';
    }
    return 'circle--cancelado';
  }

}
